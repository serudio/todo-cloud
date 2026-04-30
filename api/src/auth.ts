import type { Context, Next } from 'hono';
import { createSupabaseClient } from './supabase.js';

export type AuthenticatedUser = {
  id: string;
  email: string | undefined;
};

type Variables = {
  accessToken: string;
  user: AuthenticatedUser;
};

export type AppContext = {
  Variables: Variables;
};

function getBearerToken(header: string | undefined) {
  const [scheme, token] = header?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireUser(context: Context<AppContext>, next: Next) {
  const accessToken = getBearerToken(context.req.header('authorization'));

  if (!accessToken) {
    return context.json({ error: 'Missing bearer token' }, 401);
  }

  const supabase = createSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return context.json({ error: 'Invalid bearer token' }, 401);
  }

  context.set('accessToken', accessToken);
  context.set('user', {
    id: data.user.id,
    email: data.user.email,
  });

  return next();
}
