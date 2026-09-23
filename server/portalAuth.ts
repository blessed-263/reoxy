import type { Request, Response, NextFunction } from 'express';
import {
  createAnonClient,
  createServiceClient,
  isCustomerUser,
  portalAuthConfigured,
} from './supabaseAuth.ts';
import { upsertPortalProfile } from './portalQuotes.ts';

const ACCESS_COOKIE = 'portal_access';
const REFRESH_COOKIE = 'portal_refresh';
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 12;

const loginHits = new Map<string, { n: number; reset: number }>();

export type PortalSession = {
  userId: string;
  email: string;
};

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

function setPortalCookies(req: Request, res: Response, accessToken: string, refreshToken: string) {
  res.setHeader('Set-Cookie', [
    cookieParts(req, ACCESS_COOKIE, accessToken, ACCESS_MAX_AGE),
    cookieParts(req, REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE),
  ]);
}

function clearPortalCookies(req: Request, res: Response) {
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

async function sessionFromTokens(access: string, refresh: string, req: Request, res: Response) {
  const supabase = createAnonClient();
  if (access) {
    const { data, error } = await supabase.auth.getUser(access);
    if (!error && data.user?.email && isCustomerUser(data.user)) {
      return { userId: data.user.id, email: data.user.email };
    }
  }
  if (!refresh) return null;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh });
  if (error || !data.session?.access_token || !data.user?.email || !isCustomerUser(data.user)) {
    return null;
  }
  setPortalCookies(req, res, data.session.access_token, data.session.refresh_token);
  return { userId: data.user.id, email: data.user.email };
}

export async function resolvePortalSession(req: Request, res: Response): Promise<PortalSession | null> {
  if (!portalAuthConfigured()) return null;
  const cookies = parseCookies(req.headers.cookie);
  return sessionFromTokens(cookies[ACCESS_COOKIE] || '', cookies[REFRESH_COOKIE] || '', req, res);
}

export async function requirePortalAuth(req: Request, res: Response, next: NextFunction) {
  if (!portalAuthConfigured()) {
    return res.status(503).json({ error: 'Portal is not configured on the server.' });
  }
  const session = await resolvePortalSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as Request & { portal?: PortalSession }).portal = session;
  next();
}

function portalUser(req: Request) {
  return (req as Request & { portal?: PortalSession }).portal;
}

export async function handlePortalSignup(req: Request, res: Response) {
  if (!portalAuthConfigured()) {
    return res.status(503).json({ error: 'Portal is not configured on the server.' });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  const fullName = String(req.body?.fullName || req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = String(req.body?.phone || '').trim();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const admin = createServiceClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'customer' },
    user_metadata: { full_name: fullName, phone },
  });
  if (createError || !created.user) {
    const message = createError?.message || 'Could not create account';
    if (/already/i.test(message) || /registered/i.test(message)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[portal] signup', message);
    return res.status(400).json({ error: 'Could not create account' });
  }

  await upsertPortalProfile({
    userId: created.user.id,
    fullName,
    email,
    phone,
  });

  const anon = createAnonClient();
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user?.email) {
    return res.status(201).json({ ok: true, user: email, needsLogin: true });
  }
  setPortalCookies(req, res, data.session.access_token, data.session.refresh_token);
  return res.status(201).json({ ok: true, user: data.user.email, name: fullName });
}

export async function handlePortalLogin(req: Request, res: Response) {
  if (!portalAuthConfigured()) {
    return res.status(503).json({ error: 'Portal is not configured on the server.' });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user?.email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!isCustomerUser(data.user)) {
    return res.status(403).json({ error: 'This account is not a customer portal account' });
  }
  await upsertPortalProfile({
    userId: data.user.id,
    fullName: String(data.user.user_metadata?.full_name || ''),
    email: data.user.email,
    phone: String(data.user.user_metadata?.phone || ''),
  });
  setPortalCookies(req, res, data.session.access_token, data.session.refresh_token);
  return res.json({ ok: true, user: data.user.email });
}

export async function handlePortalLogout(req: Request, res: Response) {
  const cookies = parseCookies(req.headers.cookie);
  const access = cookies[ACCESS_COOKIE];
  const refresh = cookies[REFRESH_COOKIE];
  if (access && refresh && portalAuthConfigured()) {
    try {
      const supabase = createAnonClient();
      await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
      await supabase.auth.signOut();
    } catch {
      // Cookies are cleared either way.
    }
  }
  clearPortalCookies(req, res);
  return res.json({ ok: true });
}

export async function handlePortalMe(req: Request, res: Response) {
  if (!portalAuthConfigured()) {
    return res.status(503).json({ error: 'Portal is not configured on the server.' });
  }
  const session = await resolvePortalSession(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ ok: true, user: session.email, userId: session.userId });
}

export function portalSessionFrom(req: Request) {
  return portalUser(req);
}
