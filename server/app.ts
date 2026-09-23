import 'dotenv/config';
import express, { Router, type Request, type Response, type NextFunction } from 'express';
import { pool } from './db.ts';
import { corsMiddleware } from './cors.ts';
import { deleteReceipt, getReceipt, listReceipts, upsertReceipt } from './receiptsRepo.ts';
import { deleteItinerary, getItinerary, listItineraries, upsertItinerary } from './itinerariesRepo.ts';
import { handleLogin, handleLogout, handleMe, requireAuth } from './auth.ts';
import {
  handlePortalLogin,
  handlePortalLogout,
  handlePortalMe,
  handlePortalSignup,
  portalSessionFrom,
  requirePortalAuth,
} from './portalAuth.ts';
import { catalogServices, createPortalQuote, listPortalQuotes } from './portalQuotes.ts';
import { sendQuoteEmails } from './portalMail.ts';

const apiRouter = Router();

function pingDb() {
  if (!pool) {
    const err = new Error('DATABASE_URL is not set');
    (err as Error & { status?: number }).status = 503;
    throw err;
  }
  return pool.query('SELECT 1');
}

apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path.startsWith('/public/')) return next();
  if (req.path.startsWith('/portal/')) return next();
  if (req.path === '/auth/login' || req.path === '/auth/logout' || req.path === '/auth/me') return next();
  void requireAuth(req, res, next).catch(next);
});

apiRouter.post('/auth/login', (req, res, next) => {
  void handleLogin(req, res).catch(next);
});
apiRouter.post('/auth/logout', (req, res, next) => {
  void handleLogout(req, res).catch(next);
});
apiRouter.get('/auth/me', (req, res, next) => {
  void handleMe(req, res).catch(next);
});

apiRouter.post('/portal/signup', (req, res, next) => {
  void handlePortalSignup(req, res).catch(next);
});
apiRouter.post('/portal/login', (req, res, next) => {
  void handlePortalLogin(req, res).catch(next);
});
apiRouter.post('/portal/logout', (req, res, next) => {
  void handlePortalLogout(req, res).catch(next);
});
apiRouter.get('/portal/me', (req, res, next) => {
  void handlePortalMe(req, res).catch(next);
});
apiRouter.get('/portal/services', (_req, res) => {
  res.json(catalogServices());
});
apiRouter.get('/portal/quotes', (req, res, next) => {
  void requirePortalAuth(req, res, async () => {
    try {
      const session = portalSessionFrom(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });
      res.json(await listPortalQuotes(session.userId));
    } catch (err) {
      sendError(res, err);
    }
  }).catch(next);
});
apiRouter.post('/portal/quotes', (req, res, next) => {
  void requirePortalAuth(req, res, async () => {
    try {
      const session = portalSessionFrom(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });
      const serviceIds = Array.isArray(req.body?.serviceIds)
        ? req.body.serviceIds.map((value: unknown) => String(value))
        : [];
      const notes = String(req.body?.notes || '').trim();
      const quote = await createPortalQuote({ userId: session.userId, serviceIds, notes });
      await sendQuoteEmails(quote).catch((err) => {
        console.error('[portal] mail', err);
      });
      res.status(201).json(quote);
    } catch (err) {
      sendError(res, err);
    }
  }).catch(next);
});

apiRouter.get('/health', async (_req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, database: 'missing', error: 'DATABASE_URL is not set' });
  }
  try {
    await pingDb();
    return res.json({ ok: true, database: 'connected' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return res.status(503).json({ ok: false, database: 'error', error: message });
  }
});

function sendError(res: Response, err: unknown) {
  const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status: number }).status) : 500;
  const message = err instanceof Error ? err.message : 'Server error';
  res.status(status || 500).json({ error: message });
}

apiRouter.get('/receipts', async (_req, res) => {
  try {
    res.json(await listReceipts());
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.put('/receipts/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });
    res.json(await upsertReceipt(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.delete('/receipts/:id', async (req, res) => {
  try {
    const ok = await deleteReceipt(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/itineraries', async (_req, res) => {
  try {
    res.json(await listItineraries());
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.put('/itineraries/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });
    res.json(await upsertItinerary(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.delete('/itineraries/:id', async (req, res) => {
  try {
    const ok = await deleteItinerary(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/public/receipts/:id', async (req, res) => {
  try {
    const doc = await getReceipt(String(req.params.id));
    if (!doc) return res.status(404).json({ ok: false, error: 'Receipt not found' });
    res.json({ ok: true, type: 'receipt', document: doc });
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/public/itineraries/:id', async (req, res) => {
  try {
    const doc = await getItinerary(String(req.params.id));
    if (!doc) return res.status(404).json({ ok: false, error: 'Ticket not found' });
    res.json({ ok: true, type: 'itinerary', document: doc });
  } catch (err) {
    sendError(res, err);
  }
});

export { apiRouter };

export function createApiExpress() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);
  app.use((req, _res, next) => {
    const body = (req as Request & { body?: unknown }).body;
    if (Buffer.isBuffer(body)) {
      try {
        req.body = JSON.parse(body.toString('utf8'));
      } catch {
        req.body = {};
      }
      (req as Request & { _body?: boolean })._body = true;
    } else if (typeof body === 'string' && body.trim()) {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }
      (req as Request & { _body?: boolean })._body = true;
    } else if (body && typeof body === 'object') {
      (req as Request & { _body?: boolean })._body = true;
    }
    next();
  });
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRouter);
  app.use(apiRouter);
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    sendError(res, err);
  });
  return app;
}
