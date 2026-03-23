import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import { createClient } from '@libsql/client';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
    const res = await db.execute('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    const oldCategories = res.rows.map(r => r.category);
    console.log("Categorias antiguas encontradas:", oldCategories);
    
    // Update statements
    const mappings = [
        ['Pollo', 'Disfraces'],
        ['Parrilla', 'Uniformes'],
        ['Pastas', 'Maquillaje'],
        ['Minutas', 'Accesorios'],
        ['Empanadas', 'Pelucas'],
        ['Bebidas', 'Máscaras'],
        ['Guarniciones', 'Complementos']
    ];
    
    for (const [oldCat, newCat] of mappings) {
        await db.execute({
            sql: 'UPDATE products SET category = ? WHERE category = ?',
            args: [newCat, oldCat]
        });
    }
    
    await db.execute("UPDATE products SET category = 'Disfraces' WHERE category IN ('Pizzas', 'Sándwiches')");
    
    console.log("Migración completada con exito.");
}
run().catch(console.error);
