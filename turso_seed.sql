-- Seed / export from local.db for loading into Turso (SQLite/libSQL)
-- Tables assumed to already exist on target.
-- If you want a clean load, uncomment DELETE statements.
PRAGMA foreign_keys=OFF;
BEGIN;

-- combos (4 rows)
-- DELETE FROM combos;
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES ('c1', 'Combo Familiar', '1 Pollo + 1 Pizza + Coca 1.5L', 18000, 'Pollo, Pizza, Coca', '/images/combo1.jpg', 1);
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES ('c2', 'Parrillada x2', 'Asado, Vacio, Chori, Morci', 22000, 'Asado, Vacio', '/images/Combo2.jpg', 1);
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES ('c3', 'Sandwich Mila Pack', '2 Sandwiches + Papas', 18000, '2 Sanguches, Papas', '/images/Combo3.jpg', 1);
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES ('c4', 'Super Picada', 'Fiambres varios y queso', 15000, 'Salame, Queso, Pan', '/images/combo4.jpg', 1);

-- config (3 rows)
-- DELETE FROM config;
INSERT INTO config (key, value) VALUES ('whatsapp', '+543704054127');
INSERT INTO config (key, value) VALUES ('horario', 'Mar a Dom 20:00 - 01:00');
INSERT INTO config (key, value) VALUES ('envio_base', '10000');

-- order_items (2 rows)
-- DELETE FROM order_items;
INSERT INTO order_items (id, order_id, product_name, quantity, price) VALUES (1, '1770144337', 'Combo Familiar', 1, 18000);
INSERT INTO order_items (id, order_id, product_name, quantity, price) VALUES (2, '1770145185', 'Combo Familiar', 1, 18000);

-- orders (2 rows)
-- DELETE FROM orders;
INSERT INTO orders (id, date, customer_name, customer_phone, delivery_method, delivery_address, payment_method, total, status, comments, items_display) VALUES ('1770144337', '2026-02-03T18:45:37.223Z', 'Oky', '+543704054127', 'retiro', '', 'efectivo', 18000, 'Nuevo', '', '1x Combo Familiar');
INSERT INTO orders (id, date, customer_name, customer_phone, delivery_method, delivery_address, payment_method, total, status, comments, items_display) VALUES ('1770145185', '2026-02-03T18:59:45.137Z', 'oky', '+543704054127', 'retiro', '', 'efectivo', 18000, 'Nuevo', 'ccc', '1x Combo Familiar');

-- products (10 rows)
-- DELETE FROM products;
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (1, 'Pollo al Spiedo', 'Con papas fritas abundantes', 12023, 'Pollo', 'https://drive.google.com/file/d/1-Hb5W5P1anWxhSaAIUgreCxgEJ9fGPg5/view?usp=drive_link', 1, 1);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (2, 'Canelones de Verdura', 'Salsa mixta, porcion abundante', 8500, 'Pastas', 'https://drive.google.com/file/d/1A1w0p0cMCeemTtwQEY7JDuFD5rBp9-RV/view?usp=drive_link', 1, 2);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (3, 'Empanada Carne', 'Frita cortada a cuchillo', 1500, 'Empanadas', '/images/empanada.jpg', 1, 3);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (4, 'Pizza Muzzarella', 'Grande 8 porciones', 8000, 'Pizzas', 'https://drive.google.com/file/d/13sCwg58a2lwcA0_Wu4EEI_teA7svc7fY/view?usp=drive_link', 1, 4);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (5, 'Hamburguesa Clásica', 'Jamón, Queso, Lechuga, Tomate, Mayonesa, Ketchup.
Aderezos a elección', 4000, 'Parrilla', 'https://drive.google.com/file/d/1iRGAmFEMZor-8dpGbnk8anvPJSpxPaiC/view?usp=drive_link', 1, 1);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (6, 'Pollo al Spiedo', 'Con papas fritas abundantes y sopa py', 12500, 'Pollo', 'https://drive.google.com/file/d/1-Hb5W5P1anWxhSaAIUgreCxgEJ9fGPg5/view', 1, 1);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (7, 'Canelones de Espinaca', 'Salsa, porcion abundante', 8500, 'Pastas', 'https://drive.google.com/file/d/1UlgLF1MTxhNwU3NTTEh42_f7zyF_Hyq0/view?usp=drive_link', 1, 2);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (8, 'Empanada Jamón y Queso', 'jamón y queso de primera calidad', 15000, 'Empanadas', '/images/empanada.jpg', 1, 3);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (9, 'Pizza Calabresa', 'Grande 8 porciones', 8000, 'Pizzas', 'https://drive.google.com/file/d/1tClMMGHRVlVbV8aPPEIaOyxjA_Z4gHjo/view?usp=drive_link', 1, 4);
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES (10, 'Sandwich de Bondiola', 'Aderezos a elección:
Mayonesa, Ketchup, Salsa criolla y chimichurri', 14000, 'Parrilla', 'https://drive.google.com/file/d/1JNOtWHs6eeOT2F2FdH2XfI5zC2IN3e7h/view?usp=drive_link', 1, 5);
COMMIT;
PRAGMA foreign_keys=ON;