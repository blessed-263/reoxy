import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '').trim();
}

export function supabaseAnonKey() {
  return String(process.env.SUPABASE_ANON_KEY || '').trim();
}

export function deskOperators(): string[] {
  return String(process.env.DESK_OPERATORS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function authConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey() && deskOperators().length > 0);
}

export function isDeskOperator(email?: string | null) {
  if (!email) return false;
  return deskOperators().includes(email.trim().toLowerCase());
}

export function createAnonClient(): SupabaseClient {
  if (!authConfigured()) {
    throw new Error('Supabase Auth is not configured');
  }
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
