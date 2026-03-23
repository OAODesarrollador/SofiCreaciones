-- ✅ SQL VERIFICADO para Turso
-- Copiar y pegar TODO esto en el editor SQL de Turso

-- Limpiar datos existentes
DELETE FROM products;
DELETE FROM combos;
DELETE FROM config;

-- Insertar productos (respetando orden exacto del schema)
INSERT INTO products (name, description, price, category, image, available, sort_order) VALUES
('Asado Completo', 'Asado con chorizo, morcilla y costillar', 85000, 'Asados', NULL, 1, 1),
('Pollo a la Parrilla', 'Medio pollo fresco a la parrilla', 45000, 'Aves', NULL, 1, 2),
('Costillar', 'Costillar de ternera tierno', 55000, 'Carnes', NULL, 1, 3),
('Empanadas de Carne', 'Docena de empanadas caseras', 12000, 'Empanadas', NULL, 1, 4),
('Choripán', 'Chorizo fresco en pan', 6500, 'Sándwiches', NULL, 1, 5);

-- Insertar combos
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES
('c1', 'Combo Asador', 'Asado completo + 4 costillas + 2 chorizos', 120000, 'Asado, 4 Costillas, 2 Chorizos', NULL, 1),
('c2', 'Combo Familia', 'Pollo + costillas + empanadas', 95000, 'Pollo, Costillas, Empanadas', NULL, 1);

-- Insertar configuración
INSERT INTO config (key, value) VALUES
('empresa_nombre', 'Rotisería La Parrilla'),
('empresa_telefono', '+54 9 1234 567890'),
('empresa_whatsapp', '+54 9 1234 567890');

-- Verificar datos insertados
SELECT 'Products: ' || COUNT(*) as status FROM products
UNION ALL
SELECT 'Combos: ' || COUNT(*) FROM combos
UNION ALL
SELECT 'Config: ' || COUNT(*) FROM config;
