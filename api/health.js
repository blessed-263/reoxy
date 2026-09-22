import pg from 'pg';

function databaseUrl() {
  let url = String(process.env.DATABASE_URL || '').trim();
  if (!url) return '';
  if (/:6543\b/.test(url) && !/[?&]pgbouncer=true/.test(url)) {
    url += `${url.includes('?') ? '&' : '?'}pgbouncer=true`;
  }
  return url;
}

export default async function handler(_req, res) {
  const connectionString = databaseUrl();
  if (!connectionString) {
    res.status(503).json({ ok: false, database: 'missing', error: 'DATABASE_URL is not set' });
    return;
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 8000,
  });

  try {
    await pool.query('SELECT 1');
    res.status(200).json({ ok: true, database: 'connected' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    res.status(503).json({ ok: false, database: 'error', error: message });
  } finally {
    await pool.end().catch(() => {});
  }
}
