#!/usr/bin/env node
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';

const LOCAL_DB = 'local.db';
const TURSO_URL = 'libsql://local-okyformosa.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzAxNDYwOTcsImlkIjoiNTJmMzJmY2YtNjA1MC00MDgwLTg1ZTQtMzg0OGU3OWZkYjgyIiwicmlkIjoiY2RjZjhiNDAtNDk4NC00YWFlLTk0MmItYTgyNzA4OWNiYzM3In0.jySO1YtJqAXpggkRoYg5yvdaK9io6SzENplWAQQOMSLnJnSIXN-bBqnzrCJCKMNkiaAz2jbIv369p1jbwrsNCw';

console.log('🔄 Iniciando migración de datos...\n');

try {
  // Conectar a BD local
  const localDb = new Database(LOCAL_DB);
  console.log('✓ Conectado a local.db');

  // Obtener datos de productos
  const products = localDb.prepare('SELECT * FROM products').all();
  console.log(`✓ Encontrados ${products.length} productos en local.db`);

  // Obtener datos de combos
  const combos = localDb.prepare('SELECT * FROM combos').all();
  console.log(`✓ Encontrados ${combos.length} combos en local.db`);

  // Obtener datos de config
  const config = localDb.prepare('SELECT * FROM config').all();
  console.log(`✓ Encontrados ${config.length} registros de config en local.db\n`);

  // Conectar a Turso
  const tursoClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
  console.log('✓ Conectado a Turso\n');

  // Migrar productos
  if (products.length > 0) {
    console.log('📦 Migrando productos...');
    for (const product of products) {
      await tursoClient.execute({
        sql: 'INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
          product.image,
          product.available || 1,
          product.sort_order || 99
        ]
      });
    }
    console.log(`✓ ${products.length} productos migrados\n`);
  }

  // Migrar combos
  if (combos.length > 0) {
    console.log('🎁 Migrando combos...');
    for (const combo of combos) {
      await tursoClient.execute({
        sql: 'INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [
          combo.id,
          combo.name,
          combo.description,
          combo.price,
          combo.items,
          combo.image,
          combo.highlighted || 0
        ]
      });
    }
    console.log(`✓ ${combos.length} combos migrados\n`);
  }

  // Migrar config
  if (config.length > 0) {
    console.log('⚙️  Migrando configuración...');
    for (const item of config) {
      await tursoClient.execute({
        sql: 'INSERT INTO config (key, value) VALUES (?, ?)',
        args: [item.key, item.value]
      });
    }
    console.log(`✓ ${config.length} registros de config migrados\n`);
  }

  console.log('✅ Migración completada exitosamente');
  localDb.close();
  process.exit(0);

} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
}
