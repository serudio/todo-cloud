import { createClient } from '@supabase/supabase-js';
import { readEnv } from './env.js';

const env = readEnv();

export function createSupabaseClient(accessToken?: string) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}
