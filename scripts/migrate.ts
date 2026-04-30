import { existsSync, readFileSync } from 'node:fs';
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

const migration = readFileSync(
  'supabase/migrations/0001_initial_schema.sql',
  'utf8',
);

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

await client.connect();
await client.query(migration);
await client.end();

console.log('Migration applied successfully.');
