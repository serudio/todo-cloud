import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { requireUser, type AppContext } from './auth.js';
import { createSupabaseClient } from './supabase.js';
import { readEnv } from './env.js';

const env = readEnv();
const app = new Hono<AppContext>();

app.get('/health', (context) => {
  return context.json({ ok: true });
});

app.get('/me', requireUser, async (context) => {
  const user = context.get('user');
  const accessToken = context.get('accessToken');
  const supabase = createSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', user.id)
    .single();

  if (error) {
    return context.json({ error: error.message }, 500);
  }

  return context.json({ user: data });
});

app.get('/todo-lists', requireUser, async (context) => {
  const user = context.get('user');
  const accessToken = context.get('accessToken');
  const supabase = createSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from('todo_lists')
    .select('id, name, items, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return context.json({ error: error.message }, 500);
  }

  return context.json({ todoLists: data });
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);
