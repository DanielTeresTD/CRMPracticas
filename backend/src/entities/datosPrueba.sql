-- ⚠️ IMPORTANTE: Asegúrate de tener un backup si esto es en un entorno importante

-- Desactivar restricciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Vaciar tablas en el orden correcto y reiniciar autoincrementales
TRUNCATE TABLE data_usage;
TRUNCATE TABLE client_phones;
TRUNCATE TABLE client;

-- Activar de nuevo claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar clientes
INSERT INTO client (NameClient, Direction, email) VALUES
('Alice Johnson', '123 Apple St', 'alice@example.com'),
('Bob Smith', '456 Banana Ave', 'bob@example.com'),
('Carla Gomez', '789 Cherry Blvd', 'carla@example.com'),
('David Lee', '321 Date Dr', 'david@example.com'),
('Eva Martín', '654 Elderberry Way', 'eva@example.com');

-- Insertar teléfonos asociados a los clientes (usando los IDs autogenerados del 1 al 5)
-- Suponiendo que los clientes insertados tienen IDs 1 al 5
INSERT INTO client_phones (PhoneNum, ClientID, currDate) VALUES
('600000001', 1, NOW()),
('600000002', 1, NOW()),
('600000003', 2, NOW()),
('600000004', 3, NOW()),
('600000005', 4, NOW()),
('600000006', 5, NOW());

-- Insertar datos de uso para phoneID 1 a 6
-- Datos variados por año y mes para pruebas
INSERT INTO data_usage (month, year, dataUsage, phoneID) VALUES
-- phoneID 1
(1, 2024, 100.50, 1),
(2, 2024, 150.00, 1),
(1, 2025, 200.00, 1),

-- phoneID 2
(1, 2024, 120.00, 2),
(2, 2025, 180.25, 2),

-- phoneID 3
(5, 2023, 90.00, 3),
(6, 2023, 85.25, 3),
(7, 2024, 110.50, 3),

-- phoneID 4
(10, 2022, 50.00, 4),
(11, 2022, 65.50, 4),
(12, 2023, 70.00, 4),

-- phoneID 5
(1, 2024, 80.25, 5),
(2, 2025, 95.00, 5),

-- phoneID 6
(3, 2024, 130.00, 6),
(4, 2025, 95.75, 6);
