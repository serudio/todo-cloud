-- Pushing a weekly quota out of the way, the same two ways a task can be.
--
-- A quota shares the cloud with the tasks now, so it needs the same answers to
-- "not this hour" and "not today". Both are stored the way a task stores them,
-- and both release themselves: the snooze by a timestamp that simply passes,
-- and "not today" by holding the local date it was set on, so tomorrow is a
-- different date and the quota is back. Nothing has to run to undo either.
alter table public.weekly_activities
  add column snoozed_until bigint,
  add column not_today_date text;
