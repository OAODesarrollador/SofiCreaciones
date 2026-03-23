import { db } from '../src/lib/db/index.js';
import { products, combos, config } from '../src/lib/db/schema.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SEED_PRODUCTS = [
    { name: 'Pollo al Spiedo', description: 'Con papas fritas abundantes', price: 12000, category: 'Pollo', image: '/images/combo1.jpg', available: true, sortOrder: 1 },
    { name: 'Canelones de Verdura', description: 'Salsa mixta, porcion abundante', price: 8500, category: 'Pastas', image: '/images/empanada.jpg', available: true, sortOrder: 2 },
    { name: 'Empanada Carne', description: 'Frita cortada a cuchillo', price: 1500, category: 'Empanadas', image: '/images/empanada.jpg', available: true, sortOrder: 3 },
    { name: 'Pizza Muzzarella', description: 'Grande 8 porciones', price: 8000, category: 'Pizzas', image: '/images/lista2.jpg', available: true, sortOrder: 4 },
    { name: 'Vacio a la Parrilla', description: 'Porcion tierna', price: 14000, category: 'Parrilla', image: '/images/Lista.jpg', available: true, sortOrder: 5 },
];

const SEED_COMBOS = [
    { id: 'c1', name: 'Combo Familiar', description: '1 Pollo + 1 Pizza + Coca 1.5L', price: 18000, items: 'Pollo, Pizza, Coca', image: '/images/combo1.jpg', highlighted: true },
    { id: 'c2', name: 'Parrillada x2', description: 'Asado, Vacio, Chori, Morci', price: 22000, items: 'Asado, Vacio', image: '/images/Combo2.jpg', highlighted: true },
    { id: 'c3', name: 'Sandwich Mila Pack', description: '2 Sandwiches + Papas', price: 18000, items: '2 Sanguches, Papas', image: '/images/Combo3.jpg', highlighted: true },
    { id: 'c4', name: 'Super Picada', description: 'Fiambres varios y queso', price: 15000, items: 'Salame, Queso, Pan', image: '/images/combo4.jpg', highlighted: true },
];

const SEED_CONFIG = [
    { key: 'whatsapp', value: '5491112345678' },
    { key: 'horario', value: 'Mar a Dom 11:00 - 23:00' },
    { key: 'envio_base', value: '1000' },
];

async function main() {
    console.log('Seeding database...');
    try {
        // Clear existing data to avoid duplicates if running multiple times
        console.log('Cleaning old data...');
        // Note: In SQLite/Turso, you might need to handle foreign keys if deleting from 'orders'
        // For seed, we just focus on catalog data

        await db.insert(products).values(SEED_PRODUCTS);
        await db.insert(combos).values(SEED_COMBOS);
        await db.insert(config).values(SEED_CONFIG);
        console.log('Seed done!');
    } catch (e) {
        console.error('Seed error:', e);
    }
}

main();
