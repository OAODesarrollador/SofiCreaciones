import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const LOCAL_DB = 'local.db';

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
  process.exit(1);
}

async function main() {
  try {
    console.log('🔌 Conectando a Turso...');
    const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

    console.log('📂 Abriendo local.db ...');
    const db = new Database(LOCAL_DB, { readonly: true });

    const products = db.prepare('SELECT * FROM products').all();
    const combos = db.prepare('SELECT * FROM combos').all();
    const config = db.prepare('SELECT * FROM config').all();

    console.log(`Found ${products.length} products, ${combos.length} combos, ${config.length} config rows`);

    let pCount = 0;
    for (const p of products) {
      try {
        await turso.execute({
          sql: 'INSERT INTO products (name, description, price, category, image, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [p.name, p.description, p.price, p.category, p.image || null, p.available ?? 1, p.sort_order ?? 99]
        });
        pCount++;
      } catch (err) {
        // ignore duplicates or other errors but log
        console.warn('Product insert warning:', err.message || err);
      }
    }

    let cCount = 0;
    for (const c of combos) {
      try {
        await turso.execute({
          sql: 'INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [c.id, c.name, c.description, c.price, c.items || null, c.image || null, c.highlighted ?? 0]
        });
        cCount++;
      } catch (err) {
        console.warn('Combo insert warning:', err.message || err);
      }
    }

    let cfgCount = 0;
    for (const r of config) {
      try {
        await turso.execute({ sql: 'INSERT INTO config (key, value) VALUES (?, ?)', args: [r.key, r.value] });
        cfgCount++;
      } catch (err) {
        console.warn('Config insert warning:', err.message || err);
      }
    }

    db.close();
    console.log(`✅ Migration finished. Products: ${pCount}/${products.length}, Combos: ${cCount}/${combos.length}, Config: ${cfgCount}/${config.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  }
}

main();
