export default async function handler(_req, res) {
  const appUrl = String(process.env.VITE_APP_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const configured = Boolean(
    process.env.DATABASE_URL &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.DESK_OPERATORS
  );
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(set VITE_APP_URL)',
    backend: 'same-origin /api',
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    ok: configured,
    error: configured ? null : 'Set DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, and DESK_OPERATORS',
  };

  console.log('========== ReOxy connection ==========');
  console.log(`Frontend:  ${report.frontend}`);
  console.log(`Backend:   ${report.backend}`);
  console.log(`Database:  ${report.database}`);
  console.log(`Status:    ${report.ok ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  if (report.error) console.log(`Error:     ${report.error}`);
  console.log('======================================');

  res.status(report.ok ? 200 : 503).json(report);
}
