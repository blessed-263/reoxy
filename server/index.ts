import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiExpress } from './app.ts';
import { corsMiddleware } from './cors.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 8787;
const frontend = (process.env.FRONTEND_URL || process.env.APP_URL || '').replace(/\/$/, '');

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(createApiExpress());

app.get('/verify/receipt/:id', (req, res) => {
  if (frontend) {
    res.redirect(302, `${frontend}/verify/receipt/${encodeURIComponent(String(req.params.id))}`);
    return;
  }
  res.status(200).send('Set FRONTEND_URL to your Vercel app so QR codes can open the verify page.');
});

app.get('/verify/ticket/:id', (req, res) => {
  if (frontend) {
    res.redirect(302, `${frontend}/verify/ticket/${encodeURIComponent(String(req.params.id))}`);
    return;
  }
  res.status(200).send('Set FRONTEND_URL to your Vercel app so QR codes can open the verify page.');
});

const distDir = path.resolve(__dirname, '../dist');
app.use(express.static(distDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on :${port}`);
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set — /api will return 503 until Postgres is connected.');
  }
});
