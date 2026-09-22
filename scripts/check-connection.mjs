import { checkBackendConnection, logConnectionReport } from './connection.mjs';

const report = await checkBackendConnection();
logConnectionReport(report);

if (!process.env.VITE_APP_URL) {
  console.warn('VITE_APP_URL is missing. QR links will use the current origin.');
}

if (!report.ok) {
  console.warn('Frontend will still build. Set Supabase env on Vercel before using the desk.');
}
