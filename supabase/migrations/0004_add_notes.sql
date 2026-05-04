alter table public.todo_lists
  add column if not exists notes text not null default '';

update public.todo_lists
set notes = items->>'notes'
where jsonb_typeof(items) = 'object'
  and items ? 'notes'
  and jsonb_typeof(items->'notes') = 'string';
