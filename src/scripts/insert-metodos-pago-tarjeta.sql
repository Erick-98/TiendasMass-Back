-- Script para insertar métodos de pago de tarjeta
-- Asegúrate de que la tabla Metodos_Pago tenga el campo 'tipo'

-- Verificar si ya existe un método de tarjeta
SELECT COUNT(*) as existe_tarjeta FROM Metodos_Pago WHERE tipo = 'tarjeta' OR nombre LIKE '%tarjeta%';

-- Insertar método de pago de tarjeta si no existe
INSERT INTO Metodos_Pago (nombre, descripcion, tipo, comision, activo, creado_en, actualizado_en)
SELECT 'Tarjeta de Crédito/Débito', 'Pago con tarjeta de crédito o débito (Visa, MasterCard, American Express)', 'tarjeta', 2.5, 1, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM Metodos_Pago 
    WHERE tipo = 'tarjeta' OR nombre LIKE '%tarjeta%'
);

-- Verificar que se insertó correctamente
SELECT id, nombre, descripcion, tipo, comision, activo FROM Metodos_Pago WHERE tipo = 'tarjeta';

-- Si necesitas agregar más métodos de pago de tarjeta específicos:
INSERT INTO Metodos_Pago (nombre, descripcion, tipo, comision, activo, creado_en, actualizado_en)
VALUES
  ('Visa', 'Pago con tarjeta Visa', 'tarjeta', 2.5, 1, NOW(), NOW()),
  ('MasterCard', 'Pago con tarjeta MasterCard', 'tarjeta', 2.5, 1, NOW(), NOW()),
  ('American Express', 'Pago con tarjeta American Express', 'tarjeta', 3.0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  comision = VALUES(comision),
  actualizado_en = NOW();

-- Mostrar todos los métodos de pago
SELECT id, nombre, descripcion, tipo, comision, activo FROM Metodos_Pago ORDER BY tipo, nombre; 