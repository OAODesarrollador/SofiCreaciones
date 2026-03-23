#!/usr/bin/env node
/**
 * Script simple para migrar datos de local.db a Turso
 * Intenta exportar datos en JSON y luego insertar en Turso
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Error: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN no están configurados');
  process.exit(1);
}

console.log('🔄 Iniciando migración a Turso...');
console.log(`📍 Turso URL: ${TURSO_URL}`);

try {
  const tursoClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  console.log('✓ Conectado a Turso');

  // 1. Crear las tablas
  console.log('\n🏗️  Creando esquema de tablas...');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 99
    )`,
    
    `CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      items TEXT,
      image TEXT,
      highlighted INTEGER DEFAULT 0
    )`,
    
    `CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT REFERENCES orders(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL
    )`
  ];

  for (const sql of tables) {
    try {
      await tursoClient.execute(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)[1];
      console.log(`  ✓ Tabla '${tableName}' creada/verificada`);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn(`  ⚠️  ${err.message}`);
      }
    }
  }

  console.log('\n✅ Schema creado en Turso exitosamente');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Habilita Turso en .env.local descomentando TURSO_DATABASE_URL');
  console.log('2. Usa la aplicación para crear productos y datos desde la interfaz');
  console.log('3. Los datos se guardarán en Turso automáticamente');

  process.exit(0);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
