#!/usr/bin/env node
/**
 * Script simple para migrar datos de local.db a Turso
 * Este script usa SQL directamente sin async/await
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const TURSO_URL = 'libsql://local-okyformosa.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzAxNDYwOTcsImlkIjoiNTJmMzJmY2YtNjA1MC00MDgwLTg1ZTQtMzg0OGU3OWZkYjgyIiwicmlkIjoiY2RjZjhiNDAtNDk4NC00YWFlLTk0MmItYTgyNzA4OWNiYzM3In0.jySO1YtJqAXpggkRoYg5yvdaK9io6SzENplWAQQOMSLnJnSIXN-bBqnzrCJCKMNkiaAz2jbIv369p1jbwrsNCw';

console.log('🔄 Iniciando migración de datos...\n');

// Abrir BD local
const db = new sqlite3.Database('local.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar a local.db:', err.message);
    process.exit(1);
  }
  console.log('✓ Conectado a local.db');

  // Obtener todos los productos
  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error('❌ Error al leer productos:', err.message);
      process.exit(1);
    }
    console.log(`✓ Encontrados ${products.length} productos\n`);
    console.log('📦 Primeros 3 productos:');
    products.slice(0, 3).forEach(p => {
      console.log(`   - ${p.name} ($${p.price}) [${p.category}]`);
    });
    console.log('\n✅ Migración lista para ejecutar');
    db.close();
  });
});
