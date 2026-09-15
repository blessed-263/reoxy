import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const COOKIE = 'desk_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 8;

type SessionPayload = {
  u: string;
  iat: number;
  exp: number;
};

const loginHits = new Map<string, { n: number; reset: number }>();

function envUser() {
  return String(process.env.AUTH_USER || '').trim();
}

function envPassword() {
  return String(process.env.AUTH_PASSWORD || '');
}

function signingKey() {
  const secret = String(process.env.AUTH_SECRET || process.env.AUTH_PASSWORD || '').trim();
  return secret;
}

export function authConfigured() {
  return Boolean(envUser() && envPassword() && signingKey());
}

function b64url(buf: Buffer) {
  return buf.toString('base64url');
}

function sign(encoded: string) {
  return b64url(createHmac('sha256', signingKey()).update(encoded).digest());
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

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

function readSession(req: Request): SessionPayload | null {
  if (!authConfigured()) return null;
  const raw = parseCookies(req.headers.cookie)[COOKIE];
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const encoded = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!safeEqual(sign(encoded), sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload?.u || payload.exp < Date.now()) return null;
    if (!safeEqual(payload.u, envUser())) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieParts(req: Request, value: string, maxAge: number) {
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  const secure = proto === 'https';
  const parts = [`${COOKIE}=${value}`, 'HttpOnly', 'Path=/', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(req: Request, res: Response, username: string) {
  const payload: SessionPayload = {
    u: username,
    iat: Date.now(),
    exp: Date.now() + MAX_AGE_MS,
  };
  const encoded = b64url(Buffer.from(JSON.stringify(payload)));
  res.setHeader('Set-Cookie', cookieParts(req, `${encoded}.${sign(encoded)}`, Math.floor(MAX_AGE_MS / 1000)));
}

export function clearSessionCookie(req: Request, res: Response) {
  res.setHeader('Set-Cookie', cookieParts(req, '', 0));
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

export function verifyCredentials(username: string, password: string) {
  return safeEqual(username.trim(), envUser()) && safeEqual(password, envPassword());
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const machine = process.env.API_KEY?.trim();
  if (machine && req.header('x-api-key') === machine) {
    return next();
  }
  const session = readSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export function handleLogin(req: Request, res: Response) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!verifyCredentials(username, password)) {
    randomBytes(8);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  setSessionCookie(req, res, envUser());
  return res.json({ ok: true, user: envUser() });
}

export function handleLogout(req: Request, res: Response) {
  clearSessionCookie(req, res);
  return res.json({ ok: true });
}

export function handleMe(req: Request, res: Response) {
  if (!authConfigured()) {
    return res.status(503).json({ error: 'Desk lock is not configured on the server.' });
  }
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ ok: true, user: session.u });
}
