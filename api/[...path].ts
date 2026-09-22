import type { IncomingMessage, ServerResponse } from 'http';

export const config = {
  maxDuration: 30,
};

function prefixedUrl(url?: string) {
  const raw = String(url || '/');
  const q = raw.indexOf('?');
  const path = q === -1 ? raw : raw.slice(0, q);
  const query = q === -1 ? '' : raw.slice(q);
  if (path === '/api' || path.startsWith('/api/')) return raw;
  const nextPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  return `${nextPath}${query}`;
}

function jsonError(res: ServerResponse | undefined, err: unknown) {
  console.error('[api]', err);
  if (!res || typeof res.end !== 'function' || res.headersSent) return;
  const message = err instanceof Error ? err.message : 'Function error';
  res.statusCode = 500;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: false, error: message }));
}

type ExpressApp = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<ExpressApp> | null = null;

function loadApp() {
  if (!appPromise) {
    appPromise = import('../server/app.ts').then((mod) => mod.createApiExpress() as ExpressApp);
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!res || typeof res.end !== 'function') {
      throw new Error('Expected the Node.js (req, res) runtime');
    }
    req.url = prefixedUrl(req.url);
    const app = await loadApp();
    await new Promise<void>((resolve, reject) => {
      const done = () => resolve();
      res.once('finish', done);
      res.once('close', done);
      try {
        app(req, res);
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    jsonError(res, err);
  }
}
