import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { Client } from 'pg';

function loadDotEnv() {
  if (!existsSync('.env')) return;

  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const [name, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();

    if (name && value && !process.env[name]) {
      process.env[name] = value.replace(/^["']|["']$/g, '');
    }
  }
}

loadDotEnv();

const connectionString =
  process.env.SUPABASE_DB_URL ?? process.env.VITE_SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error('Missing SUPABASE_DB_URL');
}

const migrations = readdirSync('supabase/migrations')
  .filter((fileName) => fileName.endsWith('.sql'))
  .sort();

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

await client.connect();

await client.query(`
  create table if not exists public.schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )
`);

const { rows: existingSchemaRows } = await client.query<{
  todo_lists_exists: string | null;
}>("select to_regclass('public.todo_lists') as todo_lists_exists");

if (existingSchemaRows[0]?.todo_lists_exists) {
  await client.query(`
    insert into public.schema_migrations (name)
    values ('0001_initial_schema.sql')
    on conflict (name) do nothing
  `);
}

for (const migrationFileName of migrations) {
  const { rowCount } = await client.query(
    'select 1 from public.schema_migrations where name = $1',
    [migrationFileName],
  );

  if (rowCount) {
    console.log(`Skipped ${migrationFileName}`);
    continue;
  }

  const migration = readFileSync(
    `supabase/migrations/${migrationFileName}`,
    'utf8',
  );

  await client.query('begin');
  try {
    await client.query(migration);
    await client.query(
      'insert into public.schema_migrations (name) values ($1)',
      [migrationFileName],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  console.log(`Applied ${migrationFileName}`);
}

await client.end();

console.log('Migration applied successfully.');
