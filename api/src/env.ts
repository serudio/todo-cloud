import { existsSync, readFileSync } from 'node:fs';

type Env = {
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function loadDotEnv() {
  if (!existsSync('.env')) return;

  const lines = readFileSync('.env', 'utf8').split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const [name, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();

    if (name && value && !process.env[name]) {
      process.env[name] = value.replace(/^["']|["']$/g, '');
    }
  }
}

function requireEnv(name: string, fallbackName?: string) {
  const value = process.env[name] ?? process.env[fallbackName ?? ''];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${fallbackName ? `${name} or ${fallbackName}` : name}`,
    );
  }

  return value;
}

export function readEnv(): Env {
  loadDotEnv();

  return {
    port: Number(process.env.API_PORT ?? 4000),
    supabaseUrl: requireEnv('VITE_SUPABASE_URL', 'SUPABASE_URL'),
    supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'),
  };
}
