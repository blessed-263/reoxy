import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '').trim();
}

export function supabaseAnonKey() {
  return String(process.env.SUPABASE_ANON_KEY || '').trim();
}

export function supabaseServiceRoleKey() {
  return String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
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

export function portalAuthConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey() && supabaseServiceRoleKey());
}

export function isDeskOperator(email?: string | null) {
  if (!email) return false;
  return deskOperators().includes(email.trim().toLowerCase());
}

function authClientOptions() {
  return {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  } as const;
}

export function createAnonClient(): SupabaseClient {
  if (!supabaseUrl() || !supabaseAnonKey()) {
    throw new Error('Supabase Auth is not configured');
  }
  return createClient(supabaseUrl(), supabaseAnonKey(), authClientOptions());
}

export function createServiceClient(): SupabaseClient {
  if (!supabaseUrl() || !supabaseServiceRoleKey()) {
    throw new Error('Supabase service role is not configured');
  }
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), authClientOptions());
}

export function isCustomerUser(user: { app_metadata?: Record<string, unknown> } | null | undefined) {
  return String(user?.app_metadata?.role || '') === 'customer';
}
