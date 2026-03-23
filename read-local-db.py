#!/usr/bin/env python3
"""
Script para migrar datos de local.db a Turso
"""
import sqlite3
import requests
import json

LOCAL_DB = 'local.db'
TURSO_URL = 'libsql://local-okyformosa.aws-ap-northeast-1.turso.io'
TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzAxNDYwOTcsImlkIjoiNTJmMzJmY2YtNjA1MC00MDgwLTg1ZTQtMzg0OGU3OWZkYjgyIiwicmlkIjoiY2RjZjhiNDAtNDk4NC00YWFlLTk0MmItYTgyNzA4OWNiYzM3In0.jySO1YtJqAXpggkRoYg5yvdaK9io6SzENplWAQQOMSLnJnSIXN-bBqnzrCJCKMNkiaAz2jbIv369p1jbwrsNCw'

print('🔄 Iniciando migración de datos...\n')

try:
    # Conectar a BD local
    conn = sqlite3.connect(LOCAL_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Obtener datos
    cursor.execute('SELECT * FROM products')
    products = cursor.fetchall()
    
    cursor.execute('SELECT * FROM combos')
    combos = cursor.fetchall()
    
    cursor.execute('SELECT * FROM config')
    config = cursor.fetchall()
    
    conn.close()
    
    print(f'✓ Encontrados {len(products)} productos')
    print(f'✓ Encontrados {len(combos)} combos')
    print(f'✓ Encontrados {len(config)} configuraciones\n')
    
    # Mostrar preview
    print('📦 Primeros 3 productos:')
    for p in products[:3]:
        print(f'   - {p["name"]} (${p["price"]}) [{p["category"]}]')
    
    print('\n✅ Lectura completada. Los datos están listos para migrar.')
    print('Próximo paso: Ejecutar endpoint /api/migrate?token=migrate-secret-key-2025')

except Exception as e:
    print(f'❌ Error: {e}')
    exit(1)
