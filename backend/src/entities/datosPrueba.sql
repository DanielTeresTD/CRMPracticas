-- ⚠️ IMPORTANTE: Asegúrate de tener un backup si esto es en un entorno importante

-- Desactivar restricciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Vaciar tablas en el orden correcto y reiniciar autoincrementales
TRUNCATE TABLE data_usage;
TRUNCATE TABLE client_phones;
TRUNCATE TABLE client;

-- Activar de nuevo claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar clientes con DNI
INSERT INTO client (NameClient, Direction, email, dni) VALUES
('Alice Johnson', '123 Apple St', 'alice@example.com', '12345678A'),
('Bob Smith', '456 Banana Ave', 'bob@example.com', '23456789B'),
('Carla Gomez', '789 Cherry Blvd', 'carla@example.com', '34567890C'),
('David Lee', '321 Date Dr', 'david@example.com', '45678901D'),
('Eva Martín', '654 Elderberry Way', 'eva@example.com', '56789012E');

-- Insertar teléfonos asociados a los clientes (usando los IDs autogenerados del 1 al 5)
INSERT INTO client_phones (PhoneNum, ClientID, currDate) VALUES
('600000001', 1, NOW()),
('600000002', 1, NOW()),
('600000003', 2, NOW()),
('600000004', 3, NOW()),
('600000005', 4, NOW()),
('600000006', 5, NOW());

-- Insertar datos de uso para phoneID 1 a 6
INSERT INTO data_usage (month, year, dataUsage, phoneID) VALUES
-- phoneID 1
(1, 2024, 100.50, 1),
(2, 2024, 150.00, 1),
(3, 2024, 175.75, 1),
(4, 2024, 190.00, 1),
(1, 2025, 200.00, 1),
(2, 2025, 210.00, 1),

-- phoneID 2
(1, 2024, 120.00, 2),
(2, 2024, 125.00, 2),
(3, 2024, 130.00, 2),
(4, 2025, 140.00, 2),
(2, 2025, 180.25, 2),

-- phoneID 3
(5, 2023, 90.00, 3),
(6, 2023, 85.25, 3),
(7, 2024, 110.50, 3),
(8, 2024, 115.75, 3),
(9, 2025, 120.00, 3),

-- phoneID 4
(10, 2022, 50.00, 4),
(11, 2022, 65.50, 4),
(12, 2023, 70.00, 4),
(1, 2024, 75.25, 4),
(2, 2024, 80.00, 4),

-- phoneID 5
(1, 2024, 80.25, 5),
(2, 2024, 85.00, 5),
(3, 2025, 90.50, 5),
(4, 2025, 95.00, 5),

-- phoneID 6
(3, 2024, 130.00, 6),
(4, 2024, 135.75, 6),
(5, 2025, 140.00, 6),
(6, 2025, 145.25, 6);
