-- Create table for Mercado Pago payments
CREATE TABLE IF NOT EXISTS order_payments (
    payment_id TEXT PRIMARY KEY,
    order_id TEXT,
    status TEXT,
    status_detail TEXT,
    payment_method_id TEXT,
    amount INTEGER,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);
