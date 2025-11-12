CREATE DATABASE IF NOT EXISTS tienda_eventos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tienda_eventos;

CREATE TABLE Roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE Estados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  codigoPostal VARCHAR(10),
  creado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  rolId INT,
  estadoId INT,
  FOREIGN KEY (rolId) REFERENCES Roles(id),
  FOREIGN KEY (estadoId) REFERENCES Estados(id)
) ENGINE=InnoDB;

CREATE TABLE Categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estadoId INT,
  FOREIGN KEY (estadoId) REFERENCES Estados(id)
) ENGINE=InnoDB;

CREATE TABLE Productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  marca VARCHAR(255),
  imagen VARCHAR(500),
  creado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  categoriaId INT,
  estadoId INT,
  FOREIGN KEY (categoriaId) REFERENCES Categorias(id),
  FOREIGN KEY (estadoId) REFERENCES Estados(id)
) ENGINE=InnoDB;

CREATE TABLE Metodos_Pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  comision DECIMAL(5,2) DEFAULT 0.00,
  descripcion TEXT,
  creado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE Metodos_Envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estado ENUM('pendiente','confirmado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  montoTotal DECIMAL(10,2) NOT NULL,
  direccionEnvio TEXT,
  fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_envio TIMESTAMP NULL,
  estadoPago ENUM('pendiente','pagado','fallido') DEFAULT 'pendiente',
  usuarioId INT,
  metodoPagoId INT,
  shippingMethodId INT,
  FOREIGN KEY (usuarioId) REFERENCES Usuarios(id),
  FOREIGN KEY (metodoPagoId) REFERENCES Metodos_Pago(id),
  FOREIGN KEY (shippingMethodId) REFERENCES Metodos_Envio(id)
) ENGINE=InnoDB;

CREATE TABLE Detalles_Pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedidoId INT,
  productoId INT,
  cantidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedidoId) REFERENCES Pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (productoId) REFERENCES Productos(id)
) ENGINE=InnoDB;

CREATE TABLE Reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipoReporte VARCHAR(255) NOT NULL,
  generado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  contenido TEXT,
  pedidoId INT,
  productoId INT,
  usuarioId INT,
  FOREIGN KEY (pedidoId) REFERENCES Pedidos(id),
  FOREIGN KEY (productoId) REFERENCES Productos(id),
  FOREIGN KEY (usuarioId) REFERENCES Usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE Tarjetas_Usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  tipoTarjeta VARCHAR(20),
  numeroEnmascarado VARCHAR(20) NOT NULL,
  fechaVencimiento VARCHAR(5) NOT NULL,
  nombreEnTarjeta VARCHAR(100) NOT NULL,
  creado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  FOREIGN KEY (usuarioId) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO Roles (id, nombre) VALUES
(1, 'Admin'),
(2, 'Cliente');

INSERT INTO usuarios (
  email,
  password,
  nombre,
  telefono,
  direccion,
  ciudad,
  codigoPostal,
  rolId,
  estadoId
) VALUES (
  'usuario1@example.com',
  '123456',                 -- ⚠️ en tu backend normalmente debería ir encriptado
  'Juan Pérez',
  '987654321',
  'Av. Siempre Viva 123',
  'Lima',
  '15001',
  2,                        -- 👈 id válido en tabla Roles
  1                         -- 👈 id válido en tabla Estados
);
select * FROM roles