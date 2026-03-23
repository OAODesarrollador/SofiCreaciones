import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const SQL_FILE = path.resolve(process.cwd(), 'local_dump.sql');

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
  process.exit(1);
}

if (!fs.existsSync(SQL_FILE)) {
  console.error('SQL file not found:', SQL_FILE);
  process.exit(1);
}

const sqlText = fs.readFileSync(SQL_FILE, 'utf8');
// Split statements by semicolon on its own line to be safer
const parts = sqlText.split(/;\s*\n/);

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  let executed = 0;
  for (let stmt of parts) {
    stmt = stmt.trim();
    if (!stmt) continue;
    // ensure statement ends without trailing semicolon
    try {
      console.log('Executing:', stmt.replace(/\n/g, ' ').slice(0, 120) + (stmt.length>120 ? '...' : ''));
      await client.execute({ sql: stmt });
      executed++;
    } catch (err) {
      console.error('Error executing statement:', err.message || err);
      // continue with next
    }
  }
  console.log(`Done. Executed ${executed} statements.`);
}

main().catch(err=>{console.error(err); process.exit(2);});
