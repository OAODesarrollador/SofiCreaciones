import { db } from './db';
import { products, combos, config } from './db/schema';
import { eq } from 'drizzle-orm';

// Fallback data in case DB is empty or fails (initially)
const MOCK_DATA = {
    products: [],
    combos: [],
    config: {}
};

export async function fetchCatalog() {
    try {
        const [dbProducts, dbCombos, dbConfig] = await Promise.all([
            db.select().from(products).where(eq(products.available, true)).orderBy(products.sortOrder),
            db.select().from(combos),
            db.select().from(config)
        ]);

        // Map English DB fields to Spanish UI fields
        // This avoids rewriting all components
        // Normalize image URLs (handle Google Drive share links)
        const normalizeImageUrl = (url) => {
            if (!url) return url;
            try {
                // If it's a Google Drive share link, convert to direct view link
                // Example: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
                const driveFileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
                if (driveFileMatch && driveFileMatch[1]) {
                    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
                }

                // Also accept open?id=FILE_ID style
                const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
                if (openIdMatch && openIdMatch[1]) {
                    return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
                }

                return url;
            } catch (e) {
                return url;
            }
        };

        const mappedProducts = dbProducts.map(p => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: p.price,
            categoria: p.category,
            imagen: normalizeImageUrl(p.image),
            disponible: p.available,
            orden: p.sortOrder
        }));

        const mappedCombos = dbCombos.map(c => ({
            id: c.id,
            nombre: c.name,
            descripcion: c.description,
            precio: c.price,
            items: c.items,
            imagen: normalizeImageUrl(c.image),
            destacado: c.highlighted
        }));

        // Format Config as Object
        const configMap = {};
        dbConfig.forEach(row => {
            configMap[row.key] = row.value;
        });

        return {
            products: mappedProducts,
            combos: mappedCombos,
            config: configMap
        };

    } catch (error) {
        console.error("DB Fetch Error:", error);
        return MOCK_DATA;
    }
}

/**
 * Obtener todos los productos (incluyendo no disponibles) - para admin
 */
export async function fetchAllProducts() {
    try {
        const allProducts = await db.select().from(products).orderBy(products.sortOrder);
        return allProducts.map(p => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: p.price,
            categoria: p.category,
            imagen: p.image,
            disponible: p.available,
            orden: p.sortOrder
        }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
}

/**
 * Crear nuevo producto
 */
export async function createProduct(data) {
    try {
        const { nombre, descripcion, precio, categoria, imagen, disponible = true, orden = 99 } = data;
        
        // Validaciones básicas
        if (!nombre || nombre.trim() === '') throw new Error('El nombre es requerido');
        if (!precio || isNaN(precio) || precio < 0) throw new Error('El precio debe ser un número válido');
        if (!categoria || categoria.trim() === '') throw new Error('La categoría es requerida');

        const result = await db.insert(products).values({
            name: nombre.trim(),
            description: descripcion?.trim() || null,
            price: parseInt(precio),
            category: categoria.trim(),
            image: imagen?.trim() || null,
            available: disponible,
            sortOrder: parseInt(orden) || 99
        });

        return { success: true, id: result.lastInsertRowid };
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

/**
 * Actualizar producto existente
 */
export async function updateProduct(id, data) {
    try {
        const { nombre, descripcion, precio, categoria, imagen, disponible, orden } = data;

        // Validaciones
        if (nombre && nombre.trim() === '') throw new Error('El nombre no puede estar vacío');
        if (precio !== undefined && (isNaN(precio) || precio < 0)) throw new Error('El precio debe ser un número válido');
        if (categoria && categoria.trim() === '') throw new Error('La categoría no puede estar vacía');

        const updates = {};
        if (nombre !== undefined) updates.name = nombre.trim();
        if (descripcion !== undefined) updates.description = descripcion?.trim() || null;
        if (precio !== undefined) updates.price = parseInt(precio);
        if (categoria !== undefined) updates.category = categoria.trim();
        if (imagen !== undefined) updates.image = imagen?.trim() || null;
        if (disponible !== undefined) updates.available = disponible;
        if (orden !== undefined) updates.sortOrder = parseInt(orden);

        await db.update(products)
            .set(updates)
            .where(eq(products.id, parseInt(id)));

        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

/**
 * Eliminar producto
 */
export async function deleteProduct(id) {
    try {
        await db.delete(products).where(eq(products.id, parseInt(id)));
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

/**
 * Obtener un producto por ID
 */
export async function getProductById(id) {
    try {
        const result = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
        if (result.length === 0) return null;
        
        const p = result[0];
        return {
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: p.price,
            categoria: p.category,
            imagen: p.image,
            disponible: p.available,
            orden: p.sortOrder
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

/**
 * Obtener todos los combos - para admin
 */
export async function fetchAllCombos() {
    try {
        const allCombos = await db.select().from(combos).orderBy(combos.name);
        return allCombos.map(c => ({
            id: c.id,
            nombre: c.name,
            descripcion: c.description,
            precio: c.price,
            items: c.items,
            imagen: c.image,
            destacado: c.highlighted
        }));
    } catch (error) {
        console.error("Error fetching all combos:", error);
        return [];
    }
}

/**
 * Crear nuevo combo
 */
export async function createCombo(data) {
    try {
        const { id, nombre, descripcion, precio, items, imagen, destacado = false } = data;

        if (!id || id.trim() === '') throw new Error('El ID es requerido');
        if (!nombre || nombre.trim() === '') throw new Error('El nombre es requerido');
        if (precio === undefined || isNaN(precio) || precio < 0) throw new Error('El precio debe ser un número válido');

        await db.insert(combos).values({
            id: id.trim(),
            name: nombre.trim(),
            description: descripcion?.trim() || null,
            price: parseInt(precio),
            items: items?.trim() || null,
            image: imagen?.trim() || null,
            highlighted: destacado
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating combo:", error);
        throw error;
    }
}

/**
 * Actualizar combo existente
 */
export async function updateCombo(id, data) {
    try {
        const { nombre, descripcion, precio, items, imagen, destacado } = data;

        if (!id || id.trim() === '') throw new Error('El ID es requerido');
        if (nombre !== undefined && nombre.trim() === '') throw new Error('El nombre no puede estar vacío');
        if (precio !== undefined && (isNaN(precio) || precio < 0)) throw new Error('El precio debe ser un número válido');

        const updates = {};
        if (nombre !== undefined) updates.name = nombre.trim();
        if (descripcion !== undefined) updates.description = descripcion?.trim() || null;
        if (precio !== undefined) updates.price = parseInt(precio);
        if (items !== undefined) updates.items = items?.trim() || null;
        if (imagen !== undefined) updates.image = imagen?.trim() || null;
        if (destacado !== undefined) updates.highlighted = destacado;

        await db.update(combos)
            .set(updates)
            .where(eq(combos.id, id.trim()));

        return { success: true };
    } catch (error) {
        console.error("Error updating combo:", error);
        throw error;
    }
}

/**
 * Eliminar combo
 */
export async function deleteCombo(id) {
    try {
        await db.delete(combos).where(eq(combos.id, id.trim()));
        return { success: true };
    } catch (error) {
        console.error("Error deleting combo:", error);
        throw error;
    }
}

/**
 * Obtener un combo por ID
 */
export async function getComboById(id) {
    try {
        const result = await db.select().from(combos).where(eq(combos.id, id.trim())).limit(1);
        if (result.length === 0) return null;

        const c = result[0];
        return {
            id: c.id,
            nombre: c.name,
            descripcion: c.description,
            precio: c.price,
            items: c.items,
            imagen: c.image,
            destacado: c.highlighted
        };
    } catch (error) {
        console.error("Error fetching combo:", error);
        return null;
    }
}
