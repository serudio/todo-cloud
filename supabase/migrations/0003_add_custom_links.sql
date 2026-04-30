alter table public.todo_lists
  add column if not exists links jsonb not null default '[]'::jsonb;

update public.todo_lists
set links = items->'links'
where jsonb_typeof(items) = 'object'
  and items ? 'links'
  and jsonb_typeof(items->'links') = 'array';
