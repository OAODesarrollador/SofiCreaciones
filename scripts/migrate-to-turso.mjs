#!/usr/bin/env node
/**
 * Script para migrar datos de local.db a Turso
 * Uso: node scripts/migrate-to-turso.mjs
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import Database from 'better-sqlite3';
import * as schema from '../src/lib/db/schema.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Error: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN no están configurados');
  process.exit(1);
}

console.log('🔄 Iniciando migración de BD local a Turso...');
console.log(`📍 Turso URL: ${TURSO_URL}`);

try {
  // 1. Conectar a BD local (SQLite)
  console.log('\n📂 Conectando a BD local (local.db)...');
  const localDb = new Database('local.db');
  
  // 2. Conectar a Turso
  console.log('🌐 Conectando a Turso...');
  const tursoClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
  const tursoDb = drizzle(tursoClient, { schema });

  // 3. Crear las tablas en Turso
  console.log('🏗️  Creando tablas en Turso...');
  const tableSQL = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 99
    );

    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      items TEXT,
      image TEXT,
      highlighted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      delivery_address TEXT,
      payment_method TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'Nuevo',
      comments TEXT,
      items_display TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT REFERENCES orders(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL
    );
  `;

  // Ejecutar cada statement por separado
  for (const statement of tableSQL.split(';').filter(s => s.trim())) {
    try {
      await tursoClient.execute(statement);
      console.log(`✓ ${statement.substring(0, 50)}...`);
    } catch (err) {
      // Ignorar errores de tabla ya existente
      if (!err.message.includes('already exists')) {
        console.warn(`⚠️  ${err.message}`);
      }
    }
  }

  // 4. Copiar datos de cada tabla
  console.log('\n📊 Copiando datos...');

  // Copiar products
  const products = localDb.prepare('SELECT * FROM products').all();
  console.log(`📦 Productos: ${products.length} registros`);
  for (const p of products) {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO products (id, name, description, price, category, image, available, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.name, p.description, p.price, p.category, p.image, p.available, p.sort_order],
    });
  }

  // Copiar combos
  const combos = localDb.prepare('SELECT * FROM combos').all();
  console.log(`🎁 Combos: ${combos.length} registros`);
  for (const c of combos) {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO combos (id, name, description, price, items, image, highlighted) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.name, c.description, c.price, c.items, c.image, c.highlighted],
    });
  }

  // Copiar config
  const config = localDb.prepare('SELECT * FROM config').all();
  console.log(`⚙️  Config: ${config.length} registros`);
  for (const conf of config) {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`,
      args: [conf.key, conf.value],
    });
  }

  // Copiar orders (si existen)
  try {
    const orders = localDb.prepare('SELECT * FROM orders').all();
    console.log(`📋 Órdenes: ${orders.length} registros`);
    for (const o of orders) {
      await tursoClient.execute({
        sql: `INSERT OR REPLACE INTO orders (id, date, customer_name, customer_phone, delivery_method, delivery_address, payment_method, total, status, comments, items_display) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [o.id, o.date, o.customer_name, o.customer_phone, o.delivery_method, o.delivery_address, o.payment_method, o.total, o.status, o.comments, o.items_display],
      });
    }
  } catch (err) {
    console.log('ℹ️  No hay órdenes aún');
  }

  console.log('\n✅ ¡Migración completada exitosamente!');
  console.log('Ahora puedes cambiar .env.local para usar Turso:');
  console.log(`  TURSO_DATABASE_URL=${TURSO_URL}`);
  console.log(`  TURSO_AUTH_TOKEN=<tu-token>`);

  localDb.close();
  process.exit(0);

} catch (error) {
  console.error('\n❌ Error durante migración:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
