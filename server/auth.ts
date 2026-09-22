import type { Request, Response, NextFunction } from 'express';
import { authConfigured, createAnonClient, isDeskOperator } from './supabaseAuth.ts';

const ACCESS_COOKIE = 'desk_access';
const REFRESH_COOKIE = 'desk_refresh';
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 8;

const loginHits = new Map<string, { n: number; reset: number }>();

function parseCookies(header?: string) {
  const out: Record<string, string> = {};
  for (const part of String(header || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx < 1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function cookieParts(req: Request, name: string, value: string, maxAge: number) {
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  const secure = proto === 'https';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function setAuthCookies(req: Request, res: Response, accessToken: string, refreshToken: string) {
  res.setHeader('Set-Cookie', [
    cookieParts(req, ACCESS_COOKIE, accessToken, ACCESS_MAX_AGE),
    cookieParts(req, REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE),
  ]);
}

function clearAuthCookies(req: Request, res: Response) {
  res.setHeader('Set-Cookie', [
    cookieParts(req, ACCESS_COOKIE, '', 0),
    cookieParts(req, REFRESH_COOKIE, '', 0),
  ]);
}

function clientIp(req: Request) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function loginAllowed(ip: string) {
  const now = Date.now();
  const row = loginHits.get(ip);
  if (!row || row.reset < now) {
    loginHits.set(ip, { n: 1, reset: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (row.n >= LOGIN_MAX) return false;
  row.n += 1;
  return true;
}

async function resolveOperator(req: Request, res: Response): Promise<string | null> {
  if (!authConfigured()) return null;
  const cookies = parseCookies(req.headers.cookie);
  let access = cookies[ACCESS_COOKIE] || '';
  const refresh = cookies[REFRESH_COOKIE] || '';
  if (!access && !refresh) return null;

  const supabase = createAnonClient();

  const tryUser = async (token: string) => {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) return null;
    if (!isDeskOperator(data.user.email)) return null;
    return data.user.email;
  };

  if (access) {
    const email = await tryUser(access);
    if (email) return email;
  }

  if (!refresh) return null;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh });
  if (error || !data.session?.access_token || !data.user?.email) return null;
  if (!isDeskOperator(data.user.email)) return null;
  setAuthCookies(req, res, data.session.access_token, data.session.refresh_token);
  return data.user.email;
}

export { authConfigured };

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const machine = process.env.API_KEY?.trim();
  if (machine && req.header('x-api-key') === machine) {
    return next();
  }
  const email = await resolveOperator(req, res);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export async function handleLogin(req: Request, res: Response) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  const email = String(req.body?.email || req.body?.username || '').trim().toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user?.email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!isDeskOperator(data.user.email)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  setAuthCookies(req, res, data.session.access_token, data.session.refresh_token);
  return res.json({ ok: true, user: data.user.email });
}

export async function handleLogout(req: Request, res: Response) {
  const cookies = parseCookies(req.headers.cookie);
  const access = cookies[ACCESS_COOKIE];
  const refresh = cookies[REFRESH_COOKIE];
  if (access && refresh && authConfigured()) {
    try {
      const supabase = createAnonClient();
      await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
      await supabase.auth.signOut();
    } catch {
      // Cookies are cleared either way.
    }
  }
  clearAuthCookies(req, res);
  return res.json({ ok: true });
}

export async function handleMe(req: Request, res: Response) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const email = await resolveOperator(req, res);
  if (!email) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ ok: true, user: email });
}
