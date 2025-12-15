-- ================================
-- Base de datos SaborGourmet
-- Sistema de Gestión de Reservas
-- ================================

-- Eliminar base si existe (recomendado)
DROP DATABASE IF EXISTS saborgourmet;

-- Crear base de datos
CREATE DATABASE saborgourmet
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE saborgourmet;

-- ================================
-- Tabla de usuarios
-- ================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('admin', 'mesero', 'cliente') NOT NULL DEFAULT 'cliente',
  activo BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================
-- Tabla de mesas
-- ================================
CREATE TABLE mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  capacidad INT NOT NULL CHECK (capacidad BETWEEN 1 AND 20),
  zona ENUM('terraza', 'interior', 'vip', 'exterior') NOT NULL DEFAULT 'interior',
  activa BOOLEAN DEFAULT TRUE,
  descripcion TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================
-- Tabla de horarios
-- ================================
CREATE TABLE horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diaSemana ENUM(
    'lunes','martes','miercoles',
    'jueves','viernes','sabado','domingo'
  ) NOT NULL,
  horaInicio TIME NOT NULL,
  horaFin TIME NOT NULL,
  intervaloReserva INT NOT NULL DEFAULT 30,
  duracionEstandar INT NOT NULL DEFAULT 120,
  activo BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================
-- Tabla de clientes
-- ================================
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  noShows INT DEFAULT 0,
  bloqueado BOOLEAN DEFAULT FALSE,
  notas TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clientes_usuario
    FOREIGN KEY (usuarioId)
    REFERENCES usuarios(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================
-- Tabla de reservas
-- ================================
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clienteId INT NOT NULL,
  mesaId INT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numeroPersonas INT NOT NULL CHECK (numeroPersonas >= 1),
  estado ENUM(
    'pendiente',
    'confirmada',
    'en_curso',
    'completada',
    'cancelada',
    'no_show'
  ) NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  motivoCancelacion TEXT,
  usuarioId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservas_cliente
    FOREIGN KEY (clienteId) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservas_mesa
    FOREIGN KEY (mesaId) REFERENCES mesas(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservas_usuario
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================
-- Índices
-- ================================
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_cliente ON reservas(clienteId);
CREATE INDEX idx_reservas_mesa ON reservas(mesaId);
CREATE INDEX idx_horarios_dia ON horarios(diaSemana);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_clientes_email ON clientes(email);

-- ================================
-- Datos de prueba
-- ================================

-- Usuarios (passwords deben ser bcrypt reales)
INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol, activo) VALUES
('Admin', 'Sistema', 'admin@saborgourmet.com', '$2b$10$HASH_REAL_AQUI', '3001234567', 'admin', TRUE),
('Carlos', 'Mesero', 'mesero@saborgourmet.com', '$2b$10$HASH_REAL_AQUI', '3009876543', 'mesero', TRUE),
('María', 'García', 'cliente@saborgourmet.com', '$2b$10$HASH_REAL_AQUI', '3005551234', 'cliente', TRUE);

-- Mesas
INSERT INTO mesas (numero, capacidad, zona, activa, descripcion) VALUES
('M01', 2, 'interior', TRUE, 'Mesa pequeña junto a la ventana'),
('M02', 4, 'interior', TRUE, 'Mesa mediana central'),
('M03', 4, 'interior', TRUE, 'Mesa mediana lateral'),
('M04', 6, 'interior', TRUE, 'Mesa grande interior'),
('T01', 4, 'terraza', TRUE, 'Mesa terraza con vista'),
('T02', 4, 'terraza', TRUE, 'Mesa terraza esquina'),
('T03', 6, 'terraza', TRUE, 'Mesa grande terraza'),
('V01', 8, 'vip', TRUE, 'Mesa VIP privada'),
('V02', 10, 'vip', TRUE, 'Mesa VIP grande'),
('E01', 4, 'exterior', TRUE, 'Mesa exterior jardín');

-- Horarios
INSERT INTO horarios (diaSemana, horaInicio, horaFin, intervaloReserva, duracionEstandar, activo) VALUES
('lunes','12:00:00','15:00:00',30,120,TRUE),
('lunes','19:00:00','23:00:00',30,120,TRUE),
('martes','12:00:00','15:00:00',30,120,TRUE),
('martes','19:00:00','23:00:00',30,120,TRUE),
('miercoles','12:00:00','15:00:00',30,120,TRUE),
('miercoles','19:00:00','23:00:00',30,120,TRUE),
('jueves','12:00:00','15:00:00',30,120,TRUE),
('jueves','19:00:00','23:00:00',30,120,TRUE),
('viernes','12:00:00','15:00:00',30,120,TRUE),
('viernes','19:00:00','00:00:00',30,120,TRUE),
('sabado','12:00:00','16:00:00',30,120,TRUE),
('sabado','19:00:00','00:00:00',30,120,TRUE),
('domingo','12:00:00','16:00:00',30,120,TRUE),
('domingo','19:00:00','22:00:00',30,120,TRUE);

-- Clientes
INSERT INTO clientes (nombre, apellido, email, telefono, noShows, bloqueado) VALUES
('Juan','Pérez','juan.perez@email.com','3101234567',0,FALSE),
('Ana','Martínez','ana.martinez@email.com','3109876543',0,FALSE),
('Pedro','López','pedro.lopez@email.com','3205551234',1,FALSE),
('Laura','González','laura.gonzalez@email.com','3157778888',0,FALSE),
('Diego','Rodríguez','diego.rodriguez@email.com','3189991111',0,FALSE);
