export default async function handler(_req, res) {
  const apiBase = (process.env.VITE_API_URL || '').replace(/\/$/, '');
  const appUrl = (process.env.VITE_APP_URL || '').replace(/\/$/, '');
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(VITE_APP_URL missing)',
    backend: apiBase || '(VITE_API_URL missing)',
    database: 'unknown',
    ok: false,
    error: null,
  };

  if (apiBase) {
    try {
      const health = await fetch(`${apiBase}/api/health`, { headers: { Accept: 'application/json' } });
      const body = await health.json().catch(() => ({}));
      report.database = body.database || (health.ok ? 'connected' : 'error');
      report.ok = health.ok && body.ok === true;
      if (!report.ok) report.error = body.error || `Health check HTTP ${health.status}`;
    } catch (err) {
      report.database = 'unreachable';
      report.error = err instanceof Error ? err.message : String(err);
    }
  } else {
    report.error = 'VITE_API_URL is not set on Vercel';
  }

  console.log('========== ReOxy connection ==========');
  console.log(`Frontend:  ${report.frontend}`);
  console.log(`Backend:   ${report.backend}`);
  console.log(`Database:  ${report.database}`);
  console.log(`Status:    ${report.ok ? 'CONNECTED' : 'NOT CONNECTED'}`);
  if (report.error) console.log(`Error:     ${report.error}`);
  console.log('======================================');

  res.status(report.ok ? 200 : 503).json(report);
}
