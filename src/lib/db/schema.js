import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    category: text('category').notNull(),
    image: text('image'),
    available: integer('available', { mode: 'boolean' }).default(true),
    sortOrder: integer('sort_order').default(99),
});

export const combos = sqliteTable('combos', {
    id: text('id').primaryKey(), // c1, c2 etc.
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    items: text('items'), // Simple text description of items
    image: text('image'),
    highlighted: integer('highlighted', { mode: 'boolean' }).default(false),
});

export const config = sqliteTable('config', {
    key: text('key').primaryKey(),
    value: text('value'),
});

export const orders = sqliteTable('orders', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    deliveryMethod: text('delivery_method').notNull(), // 'retiro' | 'envio'
    deliveryAddress: text('delivery_address'),
    paymentMethod: text('payment_method').notNull(),
    total: integer('total').notNull(),
    status: text('status').default('Nuevo'),
    comments: text('comments'),
    itemsDisplay: text('items_display'), // Stored JSON or Text summary for simple display
});

export const orderPayments = sqliteTable('order_payments', {
    paymentId: text('payment_id').primaryKey(),
    orderId: text('order_id').references(() => orders.id),
    status: text('status'),
    statusDetail: text('status_detail'),
    paymentMethodId: text('payment_method_id'),
    amount: integer('amount'),
    createdAt: text('created_at'),
    updatedAt: text('updated_at'),
});

// If we want detailed order items for analytics later
export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: text('order_id').references(() => orders.id),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(),
});
