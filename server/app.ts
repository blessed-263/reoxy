import 'dotenv/config';
import express, { Router, type Request, type Response, type NextFunction } from 'express';
import { ensureSchema, pool } from './db.ts';
import { corsMiddleware } from './cors.ts';
import { deleteReceipt, getReceipt, listReceipts, upsertReceipt } from './receiptsRepo.ts';
import { deleteItinerary, getItinerary, listItineraries, upsertItinerary } from './itinerariesRepo.ts';
import { handleLogin, handleLogout, handleMe, requireAuth } from './auth.ts';

const apiRouter = Router();
let schemaReady: Promise<void> | null = null;

function ready() {
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path.startsWith('/public/')) return next();
  if (req.path === '/auth/login' || req.path === '/auth/logout' || req.path === '/auth/me') return next();
  return requireAuth(req, res, next);
});

apiRouter.post('/auth/login', handleLogin);
apiRouter.post('/auth/logout', handleLogout);
apiRouter.get('/auth/me', handleMe);

apiRouter.get('/health', async (_req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, database: 'missing', error: 'DATABASE_URL is not set' });
  }
  try {
    await ready();
    await pool.query('SELECT 1');
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
    await ready();
    res.json(await listReceipts());
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.put('/receipts/:id', async (req, res) => {
  try {
    await ready();
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });
    res.json(await upsertReceipt(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.delete('/receipts/:id', async (req, res) => {
  try {
    await ready();
    const ok = await deleteReceipt(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/itineraries', async (_req, res) => {
  try {
    await ready();
    res.json(await listItineraries());
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.put('/itineraries/:id', async (req, res) => {
  try {
    await ready();
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });
    res.json(await upsertItinerary(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.delete('/itineraries/:id', async (req, res) => {
  try {
    await ready();
    const ok = await deleteItinerary(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/public/receipts/:id', async (req, res) => {
  try {
    await ready();
    const doc = await getReceipt(String(req.params.id));
    if (!doc) return res.status(404).json({ ok: false, error: 'Receipt not found' });
    res.json({ ok: true, type: 'receipt', document: doc });
  } catch (err) {
    sendError(res, err);
  }
});

apiRouter.get('/public/itineraries/:id', async (req, res) => {
  try {
    await ready();
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
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRouter);
  return app;
}
