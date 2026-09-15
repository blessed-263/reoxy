import { checkBackendConnection, logConnectionReport } from './connection.mjs';

const report = await checkBackendConnection();
logConnectionReport(report);

if (!process.env.VITE_API_URL) {
  console.error('Vercel build is missing VITE_API_URL.');
  process.exit(1);
}

if (!process.env.VITE_APP_URL) {
  console.warn('VITE_APP_URL is missing. QR links will use the current origin.');
}

if (!report.ok) {
  console.warn('Frontend will still build, but Railway/Postgres is not healthy yet.');
}
