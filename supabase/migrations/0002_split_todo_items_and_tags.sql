alter table public.todo_lists
  add column if not exists tags jsonb not null default '[]'::jsonb;

update public.todo_lists
set
  tags = case
    when jsonb_typeof(items) = 'object'
      and items ? 'tags'
      and jsonb_typeof(items->'tags') = 'array'
      then items->'tags'
    else tags
  end,
  items = case
    when jsonb_typeof(items) = 'object'
      and items ? 'todos'
      and jsonb_typeof(items->'todos') = 'array'
      then items->'todos'
    when jsonb_typeof(items) = 'object'
      and items ? 'items'
      and jsonb_typeof(items->'items') = 'array'
      then items->'items'
    when jsonb_typeof(items) = 'object'
      and items ? 'todosList'
      and jsonb_typeof(items->'todosList') = 'array'
      then items->'todosList'
    when jsonb_typeof(items) = 'array'
      then items
    else '[]'::jsonb
  end
where jsonb_typeof(items) = 'object';

alter table public.todo_lists
  alter column items set default '[]'::jsonb;
