create table public.decision_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'pros_cons' check (kind in ('pros_cons', 'compare')),
  title text not null default 'Untitled list',
  options jsonb not null default '[]'::jsonb,
  share_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index decision_lists_user_id_idx on public.decision_lists (user_id, created_at desc);

alter table public.decision_lists enable row level security;

create policy "Users can read their own decision lists"
  on public.decision_lists for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own decision lists"
  on public.decision_lists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own decision lists"
  on public.decision_lists for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own decision lists"
  on public.decision_lists for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger decision_lists_set_updated_at
  before update on public.decision_lists
  for each row execute function public.set_updated_at();

-- Share-link access. There are no RLS policies for anon, so a link holder can only
-- reach a list through these two functions, and only the row matching the token.
-- Both return jsonb so no output column name can collide with a parameter name.
create or replace function public.get_shared_decision_list(p_share_token uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', decision_lists.id,
    'kind', decision_lists.kind,
    'title', decision_lists.title,
    'options', decision_lists.options,
    'updated_at', decision_lists.updated_at
  )
  from public.decision_lists
  where decision_lists.share_token = p_share_token;
$$;

-- Link holders may edit a shared list's contents and title. They cannot reach its
-- owner, its share token, or delete the row.
create or replace function public.save_shared_decision_list(
  p_share_token uuid,
  p_title text,
  p_options jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_list public.decision_lists;
begin
  if jsonb_typeof(p_options) is distinct from 'array' then
    raise exception 'options must be a json array';
  end if;

  update public.decision_lists
  set
    title = left(coalesce(p_title, decision_lists.title), 200),
    options = p_options
  where decision_lists.share_token = p_share_token
  returning decision_lists.* into saved_list;

  if saved_list.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', saved_list.id,
    'kind', saved_list.kind,
    'title', saved_list.title,
    'options', saved_list.options,
    'updated_at', saved_list.updated_at
  );
end;
$$;

revoke all on function public.get_shared_decision_list(uuid) from public;
revoke all on function public.save_shared_decision_list(uuid, text, jsonb) from public;

grant execute on function public.get_shared_decision_list(uuid) to anon, authenticated;
grant execute on function public.save_shared_decision_list(uuid, text, jsonb) to anon, authenticated;
