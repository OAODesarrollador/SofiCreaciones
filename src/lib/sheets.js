import Papa from 'papaparse';

const MOCK_DATA = {
    products: [
        { id: '1', nombre: 'Pollo al Spiedo', descripcion: 'Con papas fritas', precio: 12000, categoria: 'Pollo', imagen: '/images/combo1.jpg', disponible: true },
        { id: '2', nombre: 'Empanada Carne', descripcion: 'Frita, jugosa', precio: 1500, categoria: 'Empanadas', imagen: '/images/empanada.jpg', disponible: true },
        { id: '3', nombre: 'Pizza Muzzarella', descripcion: 'Grande 8 porciones', precio: 8000, categoria: 'Pizzas', imagen: '/images/lista2.jpg', disponible: true },
        { id: '4', nombre: 'Vacio a la Parrilla', descripcion: 'Porcion tierna', precio: 14000, categoria: 'Parrilla', imagen: '/images/Lista.jpg', disponible: true },
    ],
    combos: [
        { id: 'c1', nombre: 'Combo Familiar', descripcion: '1 Pollo + 1 Pizza + Coca 1.5L', precio: 18000, items: 'Pollo, Pizza, Coca', imagen: '/images/combo1.jpg', destacado: true },
        { id: 'c2', nombre: 'Parrillada x2', descripcion: 'Asado, Vacio, Chori, Morci', precio: 22000, items: 'Asado, Vacio', imagen: '/images/Combo2.jpg', destacado: true },
        { id: 'c3', nombre: 'Sandwich Mila Pack', descripcion: '2 Sandwiches + Papas', precio: 18000, items: '2 Sanguches, Papas', imagen: '/images/Combo3.jpg', destacado: true },
        { id: 'c4', nombre: 'Super Picada', descripcion: 'Fiambres varios y queso', precio: 15000, items: 'Salame, Queso, Pan', imagen: '/images/combo4.jpg', destacado: true },
    ],
    config: {
        whatsapp: '5491199999999', // Placeholder
        horario: 'Mar a Dom 11:00 - 23:00',
        envio_base: 0,
        mensaje_bienvenida: '¡Bienvenido a La Parrilla!'
    }
};

async function parseCSV(url) {
    try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) throw new Error('Failed to fetch sheet');
        const text = await res.text();
        return new Promise((resolve) => {
            Papa.parse(text, {
                header: true,
                complete: (results) => resolve(results.data),
                error: () => resolve([])
            });
        });
    } catch (error) {
        console.error("CSV Parse Error", error);
        return [];
    }
}

export async function fetchCatalog() {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
    const GID_PRODUCTS = process.env.NEXT_PUBLIC_GID_PRODUCTS;
    const GID_COMBOS = process.env.NEXT_PUBLIC_GID_COMBOS;
    const GID_CONFIG = process.env.NEXT_PUBLIC_GID_CONFIG;

    if (!SHEET_ID || !GID_PRODUCTS) {
        console.warn("Using Mock Data - Setup Environment Variables to use real Sheet");
        return MOCK_DATA;
    }

    const baseUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

    try {
        const [productsRaw, combosRaw, configRaw] = await Promise.all([
            parseCSV(`${baseUrl}&gid=${GID_PRODUCTS}`),
            parseCSV(`${baseUrl}&gid=${GID_COMBOS}`),
            parseCSV(`${baseUrl}&gid=${GID_CONFIG}`)
        ]);

        // Format Products
        const products = productsRaw.map(p => ({
            ...p,
            precio: Number(p.precio),
            disponible: p.disponible?.toLowerCase() === 'true',
            orden: Number(p.orden || 99)
        })).filter(p => p.id); // Valid rows only

        // Format Combos
        const combos = combosRaw.map(c => ({
            ...c,
            precio: Number(c.precio),
            destacado: c.destacado?.toLowerCase() === 'true'
        })).filter(c => c.id);

        // Format Config
        const config = {};
        configRaw.forEach(row => {
            if (row.key) config[row.key] = row.value;
        });

        return { products, combos, config };

    } catch (e) {
        console.error("Data Fetch Error", e);
        return MOCK_DATA;
    }
}
