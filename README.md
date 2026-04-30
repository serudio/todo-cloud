# todo-cloud
todo list like tag cloud

## Run

```sh
pnpm install
pnpm dev
```

## Backend

The API is a small TypeScript service in `api/`. It expects Supabase to handle Google auth and Postgres.

```sh
cp .env.example .env
pnpm dev:api
```

Set these values in `.env`:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_DB_URL=
API_PORT=4000
```

The Supabase anon key is public. These `VITE_` values are used by the browser login page and the local API.
`SUPABASE_DB_URL` is secret and is only used to run database migrations locally.

Database schema starts in `supabase/migrations/0001_initial_schema.sql`.

Supabase setup:

1. Create a Supabase project.
2. Enable Google as an auth provider.
3. Apply the SQL migration with `pnpm db:migrate`.
4. Use Supabase access tokens as `Authorization: Bearer <token>` when calling the API.
