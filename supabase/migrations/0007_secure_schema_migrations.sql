-- The migration ledger is created by scripts/migrate.ts, which ran before any of
-- this project's own migrations and so never enabled row-level security on it.
-- Supabase grants anon and authenticated full access to every table in public by
-- default, which left the ledger readable and writable with only the anon key.
--
-- It has no policies on purpose: nothing but the migration runner should touch it,
-- and that connects as the table's owner, which bypasses RLS.
alter table public.schema_migrations enable row level security;

revoke all on table public.schema_migrations from anon, authenticated;
