import { AppDataSource } from "../config/data-source";

const createDireccionesTable = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Conexión a la base de datos establecida");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        // Crear tabla de direcciones
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS Direcciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                calle VARCHAR(200) NOT NULL,
                ciudad VARCHAR(100) NOT NULL,
                codigoPostal VARCHAR(20) NOT NULL,
                pais VARCHAR(100) DEFAULT 'Perú',
                referencia VARCHAR(100) NULL,
                esPrincipal BOOLEAN DEFAULT FALSE,
                activa BOOLEAN DEFAULT TRUE,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                usuario_id INT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log("Tabla Direcciones creada exitosamente");

        // Crear índices para mejorar el rendimiento (MySQL no soporta IF NOT EXISTS para índices)
        try {
            await queryRunner.query(`CREATE INDEX idx_direcciones_usuario_id ON Direcciones(usuario_id)`);
            console.log("Índice usuario_id creado");
        } catch (error) {
            console.log("Índice usuario_id ya existe");
        }

        try {
            await queryRunner.query(`CREATE INDEX idx_direcciones_activa ON Direcciones(activa)`);
            console.log("Índice activa creado");
        } catch (error) {
            console.log("Índice activa ya existe");
        }

        try {
            await queryRunner.query(`CREATE INDEX idx_direcciones_principal ON Direcciones(esPrincipal)`);
            console.log("Índice esPrincipal creado");
        } catch (error) {
            console.log("Índice esPrincipal ya existe");
        }

        await queryRunner.release();
        await AppDataSource.destroy();
        console.log("Migración completada");
    } catch (error) {
        console.error("Error durante la migración:", error);
        process.exit(1);
    }
};

createDireccionesTable(); 