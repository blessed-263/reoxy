import 'dotenv/config';
import { migrateSchema, pool } from './db.ts';

async function main() {
  await migrateSchema();
  await pool?.end();
  console.log('Schema migrated.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
