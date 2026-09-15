const apiBase = (process.env.VITE_API_URL || process.env.API_URL || '').replace(/\/$/, '');
const appUrl = (process.env.VITE_APP_URL || '').replace(/\/$/, '');

export async function checkBackendConnection() {
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(VITE_APP_URL missing)',
    backend: apiBase || '(VITE_API_URL missing)',
    database: 'unknown',
    ok: false,
    error: null,
  };

  if (!apiBase) {
    report.error = 'VITE_API_URL is not set on Vercel';
    return report;
  }

  try {
    const res = await fetch(`${apiBase}/api/health`, { headers: { Accept: 'application/json' } });
    const body = await res.json().catch(() => ({}));
    report.database = body.database || (res.ok ? 'connected' : 'error');
    report.ok = res.ok && body.ok === true;
    if (!report.ok) {
      report.error = body.error || `Health check HTTP ${res.status}`;
    }
  } catch (err) {
    report.database = 'unreachable';
    report.error = err instanceof Error ? err.message : String(err);
  }

  return report;
}

export function logConnectionReport(report) {
  console.log('========== ReOxy connection ==========');
  console.log(`Frontend:  ${report.frontend}`);
  console.log(`Backend:   ${report.backend}`);
  console.log(`Database:  ${report.database}`);
  console.log(`Status:    ${report.ok ? 'CONNECTED' : 'NOT CONNECTED'}`);
  if (report.error) console.log(`Error:     ${report.error}`);
  console.log('======================================');
}
