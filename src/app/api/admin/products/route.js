import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchAllProducts, createProduct, updateProduct, deleteProduct, getProductById } from '@/lib/catalog';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

/**
 * GET /api/admin/products
 * Retorna lista de todos los productos (incluyendo no disponibles)
 */
export async function GET(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const allProducts = await fetchAllProducts();
        return NextResponse.json({ success: true, data: allProducts });
    } catch (error) {
        console.error("GET /api/admin/products error:", error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

/**
 * POST /api/admin/products
 * Crear nuevo producto
 */
export async function POST(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = await createProduct(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("POST /api/admin/products error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 400 }
        );
    }
}

/**
 * PATCH /api/admin/products
 * Actualizar producto existente
 */
export async function PATCH(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const result = await updateProduct(id, updates);
        return NextResponse.json(result);
    } catch (error) {
        console.error("PATCH /api/admin/products error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to update product' },
            { status: 400 }
        );
    }
}

/**
 * DELETE /api/admin/products?id=<productId>
 * Eliminar producto
 */
export async function DELETE(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const result = await deleteProduct(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error("DELETE /api/admin/products error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete product' },
            { status: 400 }
        );
    }
}
