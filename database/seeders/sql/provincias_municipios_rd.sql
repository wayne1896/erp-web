-- ============================================
-- Provincias y Municipios de República Dominicana
-- ============================================
-- Este archivo contiene las provincias y municipios de RD
-- para ser usado como seeder en Laravel

-- Tabla de Provincias
INSERT INTO provincias (codigo, nombre, codigo_region, activo, created_at, updated_at) VALUES
('01', 'Distrito Nacional', '01', 1, NOW(), NOW()),
('02', 'Azua', '02', 1, NOW(), NOW()),
('03', 'Baoruco', '02', 1, NOW(), NOW()),
('04', 'Barahona', '02', 1, NOW(), NOW()),
('05', 'Dajabón', '03', 1, NOW(), NOW()),
('06', 'Duarte', '04', 1, NOW(), NOW()),
('07', 'Elías Piña', '03', 1, NOW(), NOW()),
('08', 'Espaillat', '04', 1, NOW(), NOW()),
('09', 'Hato Mayor', '05', 1, NOW(), NOW()),
('10', 'Independencia', '02', 1, NOW(), NOW()),
('11', 'La Altagracia', '05', 1, NOW(), NOW()),
('12', 'La Romana', '05', 1, NOW(), NOW()),
('13', 'La Vega', '04', 1, NOW(), NOW()),
('14', 'María Trinidad Sánchez', '04', 1, NOW(), NOW()),
('15', 'Monte Cristi', '03', 1, NOW(), NOW()),
('16', 'Pedernales', '02', 1, NOW(), NOW()),
('17', 'Peravia', '01', 1, NOW(), NOW()),
('18', 'Puerto Plata', '04', 1, NOW(), NOW()),
('19', 'Hermanas Mirabal', '04', 1, NOW(), NOW()),
('20', 'Samaná', '04', 1, NOW(), NOW()),
('21', 'San Cristóbal', '01', 1, NOW(), NOW()),
('22', 'San Juan', '02', 1, NOW(), NOW()),
('23', 'San Pedro de Macorís', '05', 1, NOW(), NOW()),
('24', 'Sánchez Ramírez', '04', 1, NOW(), NOW()),
('25', 'Santiago', '04', 1, NOW(), NOW()),
('26', 'Santiago Rodríguez', '03', 1, NOW(), NOW()),
('27', 'Valverde', '03', 1, NOW(), NOW()),
('28', 'Monseñor Nouel', '04', 1, NOW(), NOW()),
('29', 'Monte Plata', '01', 1, NOW(), NOW()),
('30', 'San José de Ocoa', '01', 1, NOW(), NOW()),
('31', 'Santo Domingo', '01', 1, NOW(), NOW());

-- Tabla de Municipios
-- Distrito Nacional (01)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0101', 'Santo Domingo de Guzmán', '01', 1, NOW(), NOW());

-- Azua (02)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0201', 'Azua de Compostela', '02', 1, NOW(), NOW()),
('0202', 'Estebanía', '02', 1, NOW(), NOW()),
('0203', 'Guayabal', '02', 1, NOW(), NOW()),
('0204', 'Las Charcas', '02', 1, NOW(), NOW()),
('0205', 'Las Yayas de Viajama', '02', 1, NOW(), NOW()),
('0206', 'Padre Las Casas', '02', 1, NOW(), NOW()),
('0207', 'Peralta', '02', 1, NOW(), NOW()),
('0208', 'Pueblo Viejo', '02', 1, NOW(), NOW()),
('0209', 'Sabana Yegua', '02', 1, NOW(), NOW()),
('0210', 'Tábara Arriba', '02', 1, NOW(), NOW());

-- Baoruco (03)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0301', 'Neiba', '03', 1, NOW(), NOW()),
('0302', 'Galván', '03', 1, NOW(), NOW()),
('0303', 'Los Ríos', '03', 1, NOW(), NOW()),
('0304', 'Tamayo', '03', 1, NOW(), NOW()),
('0305', 'Villa Jaragua', '03', 1, NOW(), NOW());

-- Barahona (04)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0401', 'Santa Cruz de Barahona', '04', 1, NOW(), NOW()),
('0402', 'Cabral', '04', 1, NOW(), NOW()),
('0403', 'El Peñón', '04', 1, NOW(), NOW()),
('0404', 'Enriquillo', '04', 1, NOW(), NOW()),
('0405', 'Fundación', '04', 1, NOW(), NOW()),
('0406', 'Jaquimeyes', '04', 1, NOW(), NOW()),
('0407', 'La Ciénaga', '04', 1, NOW(), NOW()),
('0408', 'Las Salinas', '04', 1, NOW(), NOW()),
('0409', 'Paraíso', '04', 1, NOW(), NOW()),
('0410', 'Polo', '04', 1, NOW(), NOW()),
('0411', 'Vicente Noble', '04', 1, NOW(), NOW());

-- Dajabón (05)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0501', 'Dajabón', '05', 1, NOW(), NOW()),
('0502', 'El Pino', '05', 1, NOW(), NOW()),
('0503', 'Loma de Cabrera', '05', 1, NOW(), NOW()),
('0504', 'Partido', '05', 1, NOW(), NOW()),
('0505', 'Restauración', '05', 1, NOW(), NOW());

-- Duarte (06)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0601', 'San Francisco de Macorís', '06', 1, NOW(), NOW()),
('0602', 'Arenoso', '06', 1, NOW(), NOW()),
('0603', 'Castillo', '06', 1, NOW(), NOW()),
('0604', 'Eugenio María de Hostos', '06', 1, NOW(), NOW()),
('0605', 'Las Guáranas', '06', 1, NOW(), NOW()),
('0606', 'Pimentel', '06', 1, NOW(), NOW()),
('0607', 'Villa Riva', '06', 1, NOW(), NOW());

-- Elías Piña (07)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0701', 'Comendador', '07', 1, NOW(), NOW()),
('0702', 'Bánica', '07', 1, NOW(), NOW()),
('0703', 'El Llano', '07', 1, NOW(), NOW()),
('0704', 'Hondo Valle', '07', 1, NOW(), NOW()),
('0705', 'Juan Santiago', '07', 1, NOW(), NOW()),
('0706', 'Pedro Santana', '07', 1, NOW(), NOW());

-- Espaillat (08)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0801', 'Moca', '08', 1, NOW(), NOW()),
('0802', 'Cayetano Germosén', '08', 1, NOW(), NOW()),
('0803', 'Gaspar Hernández', '08', 1, NOW(), NOW()),
('0804', 'Jamao al Norte', '08', 1, NOW(), NOW());

-- Hato Mayor (09)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('0901', 'Hato Mayor del Rey', '09', 1, NOW(), NOW()),
('0902', 'El Valle', '09', 1, NOW(), NOW()),
('0903', 'Sabana de la Mar', '09', 1, NOW(), NOW());

-- Independencia (10)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1001', 'Jimaní', '10', 1, NOW(), NOW()),
('1002', 'Cristóbal', '10', 1, NOW(), NOW()),
('1003', 'Duvergé', '10', 1, NOW(), NOW()),
('1004', 'La Descubierta', '10', 1, NOW(), NOW()),
('1005', 'Mella', '10', 1, NOW(), NOW()),
('1006', 'Postrer Río', '10', 1, NOW(), NOW());

-- La Altagracia (11)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1101', 'Higüey', '11', 1, NOW(), NOW()),
('1102', 'San Rafael del Yuma', '11', 1, NOW(), NOW());

-- La Romana (12)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1201', 'La Romana', '12', 1, NOW(), NOW()),
('1202', 'Guaymate', '12', 1, NOW(), NOW()),
('1203', 'Villa Hermosa', '12', 1, NOW(), NOW());

-- La Vega (13)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1301', 'Concepción de La Vega', '13', 1, NOW(), NOW()),
('1302', 'Constanza', '13', 1, NOW(), NOW()),
('1303', 'Jarabacoa', '13', 1, NOW(), NOW()),
('1304', 'Jima Abajo', '13', 1, NOW(), NOW());

-- María Trinidad Sánchez (14)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1401', 'Nagua', '14', 1, NOW(), NOW()),
('1402', 'Cabrera', '14', 1, NOW(), NOW()),
('1403', 'El Factor', '14', 1, NOW(), NOW()),
('1404', 'Río San Juan', '14', 1, NOW(), NOW());

-- Monte Cristi (15)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1501', 'San Fernando de Monte Cristi', '15', 1, NOW(), NOW()),
('1502', 'Castañuelas', '15', 1, NOW(), NOW()),
('1503', 'Guayubín', '15', 1, NOW(), NOW()),
('1504', 'Las Matas de Santa Cruz', '15', 1, NOW(), NOW()),
('1505', 'Pepillo Salcedo', '15', 1, NOW(), NOW()),
('1506', 'Villa Vásquez', '15', 1, NOW(), NOW());

-- Pedernales (16)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1601', 'Pedernales', '16', 1, NOW(), NOW()),
('1602', 'Oviedo', '16', 1, NOW(), NOW());

-- Peravia (17)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1701', 'Baní', '17', 1, NOW(), NOW()),
('1702', 'Nizao', '17', 1, NOW(), NOW()),
('1703', 'Paya', '17', 1, NOW(), NOW()),
('1704', 'Sabana Buey', '17', 1, NOW(), NOW()),
('1705', 'Villa Fundación', '17', 1, NOW(), NOW()),
('1706', 'Villa Sombrero', '17', 1, NOW(), NOW());

-- Puerto Plata (18)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1801', 'San Felipe de Puerto Plata', '18', 1, NOW(), NOW()),
('1802', 'Altamira', '18', 1, NOW(), NOW()),
('1803', 'Guananico', '18', 1, NOW(), NOW()),
('1804', 'Imbert', '18', 1, NOW(), NOW()),
('1805', 'Los Hidalgos', '18', 1, NOW(), NOW()),
('1806', 'Luperón', '18', 1, NOW(), NOW()),
('1807', 'Sosúa', '18', 1, NOW(), NOW()),
('1808', 'Villa Isabela', '18', 1, NOW(), NOW()),
('1809', 'Villa Montellano', '18', 1, NOW(), NOW());

-- Hermanas Mirabal (19)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('1901', 'Salcedo', '19', 1, NOW(), NOW()),
('1902', 'Tenares', '19', 1, NOW(), NOW()),
('1903', 'Villa Tapia', '19', 1, NOW(), NOW());

-- Samaná (20)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2001', 'Santa Bárbara de Samaná', '20', 1, NOW(), NOW()),
('2002', 'Las Terrenas', '20', 1, NOW(), NOW()),
('2003', 'Sánchez', '20', 1, NOW(), NOW());

-- San Cristóbal (21)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2101', 'San Cristóbal', '21', 1, NOW(), NOW()),
('2102', 'Bajos de Haina', '21', 1, NOW(), NOW()),
('2103', 'Cambita Garabitos', '21', 1, NOW(), NOW()),
('2104', 'Los Cacaos', '21', 1, NOW(), NOW()),
('2105', 'Sabana Grande de Palenque', '21', 1, NOW(), NOW()),
('2106', 'San Gregorio de Nigua', '21', 1, NOW(), NOW()),
('2107', 'Villa Altagracia', '21', 1, NOW(), NOW()),
('2108', 'Yaguate', '21', 1, NOW(), NOW());

-- San Juan (22)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2201', 'San Juan de la Maguana', '22', 1, NOW(), NOW()),
('2202', 'Bohechío', '22', 1, NOW(), NOW()),
('2203', 'El Cercado', '22', 1, NOW(), NOW()),
('2204', 'Juan de Herrera', '22', 1, NOW(), NOW()),
('2205', 'Las Matas de Farfán', '22', 1, NOW(), NOW()),
('2206', 'Vallejuelo', '22', 1, NOW(), NOW());

-- San Pedro de Macorís (23)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2301', 'San Pedro de Macorís', '23', 1, NOW(), NOW()),
('2302', 'Consuelo', '23', 1, NOW(), NOW()),
('2303', 'Guayacanes', '23', 1, NOW(), NOW()),
('2304', 'Quisqueya', '23', 1, NOW(), NOW()),
('2305', 'Ramón Santana', '23', 1, NOW(), NOW()),
('2306', 'San José de Los Llanos', '23', 1, NOW(), NOW());

-- Sánchez Ramírez (24)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2401', 'Cotuí', '24', 1, NOW(), NOW()),
('2402', 'Cevicos', '24', 1, NOW(), NOW()),
('2403', 'Fantino', '24', 1, NOW(), NOW()),
('2404', 'La Mata', '24', 1, NOW(), NOW());

-- Santiago (25)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2501', 'Santiago de los Caballeros', '25', 1, NOW(), NOW()),
('2502', 'Bisonó', '25', 1, NOW(), NOW()),
('2503', 'Jánico', '25', 1, NOW(), NOW()),
('2504', 'Licey al Medio', '25', 1, NOW(), NOW()),
('2505', 'Puñal', '25', 1, NOW(), NOW()),
('2506', 'Sabana Iglesia', '25', 1, NOW(), NOW()),
('2507', 'San José de las Matas', '25', 1, NOW(), NOW()),
('2508', 'Tamboril', '25', 1, NOW(), NOW()),
('2509', 'Villa González', '25', 1, NOW(), NOW());

-- Santiago Rodríguez (26)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2601', 'San Ignacio de Sabaneta', '26', 1, NOW(), NOW()),
('2602', 'Los Almácigos', '26', 1, NOW(), NOW()),
('2603', 'Monción', '26', 1, NOW(), NOW());

-- Valverde (27)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2701', 'Mao', '27', 1, NOW(), NOW()),
('2702', 'Esperanza', '27', 1, NOW(), NOW()),
('2703', 'Laguna Salada', '27', 1, NOW(), NOW());

-- Monseñor Nouel (28)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2801', 'Bonao', '28', 1, NOW(), NOW()),
('2802', 'Maimón', '28', 1, NOW(), NOW()),
('2803', 'Piedra Blanca', '28', 1, NOW(), NOW());

-- Monte Plata (29)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('2901', 'Monte Plata', '29', 1, NOW(), NOW()),
('2902', 'Bayaguana', '29', 1, NOW(), NOW()),
('2903', 'Peralvillo', '29', 1, NOW(), NOW()),
('2904', 'Sabana Grande de Boyá', '29', 1, NOW(), NOW()),
('2905', 'Yamasá', '29', 1, NOW(), NOW());

-- San José de Ocoa (30)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('3001', 'San José de Ocoa', '30', 1, NOW(), NOW()),
('3002', 'Rancho Arriba', '30', 1, NOW(), NOW()),
('3003', 'Sabana Larga', '30', 1, NOW(), NOW());

-- Santo Domingo (31)
INSERT INTO municipios (codigo, nombre, provincia_codigo, activo, created_at, updated_at) VALUES
('3101', 'Santo Domingo Este', '31', 1, NOW(), NOW()),
('3102', 'Santo Domingo Norte', '31', 1, NOW(), NOW()),
('3103', 'Santo Domingo Oeste', '31', 1, NOW(), NOW()),
('3104', 'Boca Chica', '31', 1, NOW(), NOW()),
('3105', 'Los Alcarrizos', '31', 1, NOW(), NOW()),
('3106', 'Pedro Brand', '31', 1, NOW(), NOW()),
('3107', 'San Antonio de Guerra', '31', 1, NOW(), NOW()),
('3108', 'San Luis', '31', 1, NOW(), NOW());

-- Nota: Este SQL asume que existen las tablas 'provincias' y 'municipios'
-- con las siguientes columnas mínimas:
-- provincias: id, codigo, nombre, codigo_region, activo, created_at, updated_at
-- municipios: id, codigo, nombre, provincia_codigo, activo, created_at, updated_at