import cors from 'cors';

function listedOrigins(): string[] {
  const joined = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ]
    .filter(Boolean)
    .join(',');

  return joined
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isOriginAllowed(origin?: string | null) {
  if (!origin) return true;

  const allow = listedOrigins();
  if (allow.includes('*')) return true;
  if (allow.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }

  return false;
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, origin || true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
});
