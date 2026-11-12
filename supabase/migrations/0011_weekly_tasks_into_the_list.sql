-- Weekly tasks move into the list they are already part of.
--
-- They started as their own table, back when they were their own thing on
-- their own page. They are not: a weekly task sits in the cloud with the rest
-- of them, is set aside for today or snoozed with the same two flags, and
-- differs only in being asked for a number of times a week rather than once.
-- Two tables meant two of everything - two fetches, two ways to snooze - and
-- a row in one of them could never simply be a task.
--
-- So each one becomes a todo in the list, keeping its id, its name, its
-- target, every timestamp it has been counted on, and whatever it was being
-- put off with. Then the table goes.
--
-- "The list" is the user's earliest one, because that is the one the app
-- opens; a second list would be a place these never show up again.

-- Nothing is dropped that has nowhere to land: a user with weekly activities
-- and no readable list would otherwise lose them quietly in the drop below.
-- The whole migration runs in one transaction, so this leaves the table as it
-- was rather than half-moved.
do $$
declare
  stranded integer;
begin
  select count(*)
  into stranded
  from public.weekly_activities as activities
  where not exists (
    select 1
    from public.todo_lists as lists
    where lists.user_id = activities.user_id
      and jsonb_typeof(lists.items) = 'array'
      and lists.id = (
        select inner_lists.id
        from public.todo_lists as inner_lists
        where inner_lists.user_id = activities.user_id
        order by inner_lists.created_at
        limit 1
      )
  );

  if stranded > 0 then
    raise exception '% weekly activities have no list to move into', stranded;
  end if;
end $$;

update public.todo_lists as lists
set items = lists.items || (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', activities.id::text,
        'text', activities.name,
        'done', false,
        'doneAt', null,
        'count', 1,
        'lastAddedDate', null,
        'repeatAtEndOfDay', false,
        'lastAutoAddedDate', null,
        'tagId', null,
        'link', null,
        'dueDate', null,
        'notNow', false,
        'productiveWeek', false,
        'notNowDate', null,
        'snoozedUntil', activities.snoozed_until,
        'notToday', activities.not_today_date is not null,
        'notTodayDate', activities.not_today_date,
        'weeklyTarget', activities.target,
        'weeklyDoneDates', case
          when jsonb_typeof(activities.done_dates) = 'array' then activities.done_dates
          else '[]'::jsonb
        end
      )
      order by activities.sort_order, activities.created_at
    ),
    '[]'::jsonb
  )
  from public.weekly_activities as activities
  where activities.user_id = lists.user_id
)
where jsonb_typeof(lists.items) = 'array'
  and lists.id = (
    select inner_lists.id
    from public.todo_lists as inner_lists
    where inner_lists.user_id = lists.user_id
    order by inner_lists.created_at
    limit 1
  )
  and exists (
    select 1 from public.weekly_activities as activities where activities.user_id = lists.user_id
  );

drop table public.weekly_activities;
