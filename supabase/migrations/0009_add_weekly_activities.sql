-- Things that are owed to the week rather than to a day.
--
-- "Read five times", "yoga twice", "strength three times": not tasks, which
-- are done or not done, and not rewards, which run to a target once and then
-- end. Each of these has a count per week that comes back every Monday.
--
-- Every time one is done is kept as a timestamp in done_dates rather than as a
-- running counter, so the week a count belongs to is derived from the data
-- instead of being reset by something that has to run on time. Nothing has to
-- happen at midnight on Sunday for Monday to start empty: the client prunes
-- old timestamps when it writes, keeping a few months of history for the
-- "how did last week go" row and no more.
create table public.weekly_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default '',
  -- How many times a week it should happen. One is the lowest sensible answer.
  target integer not null default 1 check (target >= 1),
  done_dates jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index weekly_activities_user_id_idx on public.weekly_activities (user_id, sort_order, created_at);

alter table public.weekly_activities enable row level security;

create policy "Users can read their own weekly activities"
  on public.weekly_activities for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own weekly activities"
  on public.weekly_activities for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly activities"
  on public.weekly_activities for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own weekly activities"
  on public.weekly_activities for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger weekly_activities_set_updated_at
  before update on public.weekly_activities
  for each row execute function public.set_updated_at();
