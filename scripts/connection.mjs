function normalizePublicUrl(raw) {
  const value = String(raw || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/$/, '');

  if (!value || value === 'VITE_APP_URL' || value === 'VITE_API_URL') {
    return '';
  }

  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

const apiBase = normalizePublicUrl(process.env.VITE_API_URL || process.env.API_URL);
const appUrl = normalizePublicUrl(process.env.VITE_APP_URL);

export async function checkBackendConnection() {
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(set VITE_APP_URL to https://reoxy.vercel.app)',
    backend: apiBase || '(set VITE_API_URL to https://reoxy-production.up.railway.app)',
    database: 'unknown',
    ok: false,
    error: null,
  };

  if (!apiBase) {
    report.error = 'VITE_API_URL is missing or missing https://';
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
