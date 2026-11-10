-- A "productive week" is a batch of tasks gathered over time and then worked
-- through in one push. The tasks themselves carry a flag inside items, so this
-- column only holds the state of the week itself: when it was started, or null
-- while one is merely being collected.
alter table public.todo_lists
  add column if not exists productive_week jsonb not null default '{}'::jsonb;
