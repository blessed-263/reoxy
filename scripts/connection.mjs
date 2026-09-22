const appUrl = String(process.env.VITE_APP_URL || '').trim();

export async function checkBackendConnection() {
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(set VITE_APP_URL to https://reoxy.vercel.app)',
    backend: 'same-origin /api',
    database: process.env.DATABASE_URL ? 'configured' : 'set DATABASE_URL on Vercel',
    ok: Boolean(process.env.DATABASE_URL && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.DESK_OPERATORS),
    error: null,
  };
  if (!report.ok) {
    report.error = 'Vercel needs DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, and DESK_OPERATORS';
  }
  return report;
}

export function logConnectionReport(report) {
  console.log('========== ReOxy connection ==========');
  console.log(`Frontend:  ${report.frontend}`);
  console.log(`Backend:   ${report.backend}`);
  console.log(`Database:  ${report.database}`);
  console.log(`Status:    ${report.ok ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  if (report.error) console.log(`Error:     ${report.error}`);
  console.log('======================================');
}
