create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.todo_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'My todo list',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.todo_lists enable row level security;

create policy "Users can read their own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read their own todo lists"
  on public.todo_lists for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own todo lists"
  on public.todo_lists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own todo lists"
  on public.todo_lists for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own todo lists"
  on public.todo_lists for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger todo_lists_set_updated_at
  before update on public.todo_lists
  for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.email
  );

  insert into public.todo_lists (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger auth_users_create_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

insert into public.users (id, name, email)
select
  id,
  coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name'),
  email
from auth.users
where email is not null
on conflict (id) do nothing;

insert into public.todo_lists (user_id)
select users.id
from public.users
where not exists (
  select 1
  from public.todo_lists
  where todo_lists.user_id = users.id
);
