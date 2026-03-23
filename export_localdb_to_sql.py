import sqlite3
import json
import html

DB = 'local.db'
OUT = 'local_dump.sql'

def quote(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val).replace("'", "''")
    return "'" + s + "'"

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('-- Dump generated from local.db\n')
    f.write('-- Tables: products, combos, config\n\n')

    # delete existing
    f.write('DELETE FROM products;\n')
    f.write('DELETE FROM combos;\n')
    f.write('DELETE FROM config;\n\n')

    # products
    cur.execute("SELECT * FROM products")
    rows = cur.fetchall()
    if rows:
        cols = rows[0].keys()
        col_list = ', '.join(cols)
        f.write('-- Insert products\n')
        for r in rows:
            vals = ', '.join(quote(r[c]) for c in cols)
            f.write(f'INSERT INTO products ({col_list}) VALUES ({vals});\n')
        f.write('\n')

    # combos
    cur.execute("SELECT * FROM combos")
    rows = cur.fetchall()
    if rows:
        cols = rows[0].keys()
        col_list = ', '.join(cols)
        f.write('-- Insert combos\n')
        for r in rows:
            vals = ', '.join(quote(r[c]) for c in cols)
            f.write(f'INSERT INTO combos ({col_list}) VALUES ({vals});\n')
        f.write('\n')

    # config
    cur.execute("SELECT * FROM config")
    rows = cur.fetchall()
    if rows:
        cols = rows[0].keys()
        col_list = ', '.join(cols)
        f.write('-- Insert config\n')
        for r in rows:
            vals = ', '.join(quote(r[c]) for c in cols)
            f.write(f'INSERT INTO config ({col_list}) VALUES ({vals});\n')
        f.write('\n')

conn.close()
print('Wrote', OUT)
