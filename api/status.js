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

export default async function handler(_req, res) {
  const apiBase = normalizePublicUrl(process.env.VITE_API_URL);
  const appUrl = normalizePublicUrl(process.env.VITE_APP_URL);
  const report = {
    vercel: 'ok',
    frontend: appUrl || '(set VITE_APP_URL to https://reoxy.vercel.app)',
    backend: apiBase || '(set VITE_API_URL to https://reoxy-production.up.railway.app)',
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
    report.error = 'VITE_API_URL is missing or missing https://';
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
