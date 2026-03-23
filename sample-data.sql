-- Script SQL para popular Turso con datos de ejemplo
-- Ejecutar esto manualmente en el dashboard de Turso

-- PRODUCTOS
INSERT INTO products (id, name, description, price, category, image, available, sort_order) VALUES
(1, 'Asado Completo', 'Asado con chorizo, morcilla y costillar', 85000, 'Asados', 'https://drive.google.com/uc?export=view&id=...', 1, 1),
(2, 'Pollo a la Parrilla', 'Medio pollo fresco a la parrilla', 45000, 'Aves', 'https://drive.google.com/uc?export=view&id=...', 1, 2),
(3, 'Costillar', 'Costillar de ternera tierno', 55000, 'Carnes', 'https://drive.google.com/uc?export=view&id=...', 1, 3),
(4, 'Empanadas de Carne', 'Docena de empanadas caseras', 12000, 'Empanadas', 'https://drive.google.com/uc?export=view&id=...', 1, 4);

-- CONFIG
INSERT INTO config (key, value) VALUES
('empresa_nombre', 'Rotisería La Parrilla'),
('empresa_telefono', '+54 123 456 7890'),
('empresa_email', 'info@laparrilla.com.ar'),
('empresa_whatsapp', '5491234567890');

-- COMBOS
INSERT INTO combos (id, name, description, price, items, image, highlighted) VALUES
('c1', 'Combo Asador', 'Asado completo + 4 costillas + 2 chorizos', 120000, '1 Asado, 4 Costillas, 2 Chorizos', 'https://drive.google.com/uc?export=view&id=...', 1);
