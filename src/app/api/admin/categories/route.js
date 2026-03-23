export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

export async function GET(req) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Select distinct categories from products
    const rows = await db.select({ category: products.category }).from(products);

    const categories = Array.from(new Set(rows.map(r => r.category).filter(Boolean))).sort();

    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error('categories error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { oldCategory, newCategory } = body || {};
    if (!oldCategory || !newCategory) {
      return NextResponse.json({ error: 'oldCategory and newCategory required' }, { status: 400 });
    }

    await db.update(products).set({ category: newCategory.trim() }).where(eq(products.category, oldCategory));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('categories PATCH error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    if (!category) {
      return NextResponse.json({ error: 'category query required' }, { status: 400 });
    }

    // Reassign products of this category to a neutral value
    const fallback = 'SIN CATEGORIA';
    await db.update(products).set({ category: fallback }).where(eq(products.category, category));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('categories DELETE error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
