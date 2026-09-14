-- Two ways to play. In 'log' mode points are logged as they are earned, so the
-- entries column grows over time. In 'checklist' mode the tasks are agreed up
-- front and crossed off as they are done, so the tasks column holds them all.
create table public.point_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mode text not null default 'log' check (mode in ('log', 'checklist')),
  name text not null default 'New reward',
  target_points integer not null default 100,
  entries jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index point_goals_user_id_idx on public.point_goals (user_id, created_at desc);

alter table public.point_goals enable row level security;

create policy "Users can read their own point goals"
  on public.point_goals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own point goals"
  on public.point_goals for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own point goals"
  on public.point_goals for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own point goals"
  on public.point_goals for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger point_goals_set_updated_at
  before update on public.point_goals
  for each row execute function public.set_updated_at();
