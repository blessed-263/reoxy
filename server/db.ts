import 'dotenv/config';
import pg from 'pg';
import { SCHEMA_SQL } from './schema.ts';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();

function sslConfig() {
  if (!connectionString) return false;
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.PGSSLMODE === 'require') return { rejectUnauthorized: false };
  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  return local ? false : { rejectUnauthorized: false };
}

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: sslConfig(),
      max: 1,
    })
  : null;

async function hasColumn(table: string, column: string) {
  if (!pool) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return rows.length > 0;
}

async function tableExists(table: string) {
  if (!pool) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return rows.length > 0;
}

function sqlStatements(sql: string) {
  return sql
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `${part};`);
}

async function migrateLegacyJson() {
  if (!pool) return;
  const receiptsAreJson = (await tableExists('receipts')) && (await hasColumn('receipts', 'payload'));
  const itinerariesAreJson = (await tableExists('itineraries')) && (await hasColumn('itineraries', 'payload'));

  if (receiptsAreJson) {
    await pool.query(`ALTER TABLE receipts RENAME TO receipts_json_legacy`);
  }
  if (itinerariesAreJson) {
    await pool.query(`ALTER TABLE itineraries RENAME TO itineraries_json_legacy`);
  }

  for (const statement of sqlStatements(SCHEMA_SQL)) {
    await pool.query(statement);
  }

  if (receiptsAreJson) {
    const { upsertReceipt } = await import('./receiptsRepo.ts');
    const { rows } = await pool.query(`SELECT payload FROM receipts_json_legacy`);
    for (const row of rows) {
      const payload = row.payload || {};
      const id = String(payload.id || '');
      if (id) await upsertReceipt(id, payload);
    }
    await pool.query(`DROP TABLE receipts_json_legacy`);
  }

  if (itinerariesAreJson) {
    const { upsertItinerary } = await import('./itinerariesRepo.ts');
    const { rows } = await pool.query(`SELECT payload FROM itineraries_json_legacy`);
    for (const row of rows) {
      const payload = row.payload || {};
      const id = String(payload.id || '');
      if (id) await upsertItinerary(id, payload);
    }
    await pool.query(`DROP TABLE itineraries_json_legacy`);
  }
}

export async function migrateSchema() {
  if (!pool) {
    throw new Error('DATABASE_URL is not set');
  }
  await migrateLegacyJson();
  for (const statement of sqlStatements(SCHEMA_SQL)) {
    await pool.query(statement);
  }
  if (!(await hasColumn('itineraries', 'payment_method'))) {
    await pool.query(
      `ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank_card'`
    );
  }
  await pool.query(`ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS visa_policy TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS fare_policy TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS boarding_policy TEXT NOT NULL DEFAULT ''`);
}

export function requirePool() {
  if (!pool) {
    const err = new Error('DATABASE_URL is not set');
    (err as Error & { status?: number }).status = 503;
    throw err;
  }
  return pool;
}
