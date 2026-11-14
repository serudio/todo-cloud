-- A list can only be saved over the version it was read at, enforced here
-- rather than trusted to the app.
--
-- The list is one document and a save replaces all of it. The app checks the
-- version before saving now, but only the app as it is today: a phone tab
-- frozen in the background for days wakes up running last week's code, still
-- holding last week's copy, and saves it. That code has never heard of a
-- version, and twice it has written an old copy over the weekly tasks.
--
-- So the rule lives in the database. Every save has to move `version` up by
-- exactly one. The current app reads the version, filters on it, and sends the
-- next one; a save from a stale copy matches no row and changes nothing. Code
-- that predates this sends no version at all, and is refused outright - it
-- cannot save anything until it is reloaded, which is the point: failing to
-- save is recoverable, and replacing the list is not.
alter table public.todo_lists
  add column version bigint not null default 0;

create function public.todo_lists_require_next_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.version is distinct from old.version + 1 then
    raise exception 'todo list save refused: it was made from version % but the list is at %, reload first',
      new.version - 1, old.version
      using errcode = '40001';
  end if;

  return new;
end;
$$;

create trigger todo_lists_require_next_version
  before update on public.todo_lists
  for each row execute function public.todo_lists_require_next_version();
