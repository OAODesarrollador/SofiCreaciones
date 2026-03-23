import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config({ path: '.env.local' });
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
  process.exit(1);
}
const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
async function main(){
  const p = await client.execute({ sql: 'SELECT COUNT(*) AS c FROM products' });
  const c = await client.execute({ sql: "SELECT COUNT(*) AS c FROM combos" });
  const conf = await client.execute({ sql: "SELECT COUNT(*) AS c FROM config" });
  console.log('products:', p.rows && p.rows[0] ? p.rows[0].c : JSON.stringify(p));
  console.log('combos:', c.rows && c.rows[0] ? c.rows[0].c : JSON.stringify(c));
  console.log('config :', conf.rows && conf.rows[0] ? conf.rows[0].c : JSON.stringify(conf));
}
main().catch(e=>{console.error(e); process.exit(2);});
