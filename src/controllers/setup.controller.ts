import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario.entity';
import { Rol } from '../entities/Rol.entity';
import { Estado } from '../entities/Estado.entity';

const usuarioRepository = AppDataSource.getRepository(Usuario);
const rolRepository = AppDataSource.getRepository(Rol);
const estadoRepository = AppDataSource.getRepository(Estado);

// Crear el primer administrador (sin autenticación)
export const createFirstAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, telefono, direccion, ciudad, codigoPostal } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      return;
    }

    // Verificar si ya existe algún usuario
    const existingUsers = await usuarioRepository.count();
    if (existingUsers > 0) {
      res.status(403).json({ error: 'Ya existe un administrador en el sistema' });
      return;
    }

    // Verificar si el email ya está en uso
    const existingUser = await usuarioRepository.findOneBy({ email });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    // Crear o verificar rol de administrador
    let adminRol = await rolRepository.findOne({
      where: { nombre: 'Administrador' }
    });

    if (!adminRol) {
      adminRol = rolRepository.create({
        nombre: 'Administrador',
        descripcion: 'Acceso completo al sistema administrativo'
      });
      await rolRepository.save(adminRol);
    }

    // Crear o verificar estado activo
    let estadoActivo = await estadoRepository.findOne({
      where: { nombre: 'Activo' }
    });

    if (!estadoActivo) {
      estadoActivo = estadoRepository.create({
        nombre: 'Activo',
        descripcion: 'Usuario activo en el sistema',
        color: '#28a745',
        orden: 1,
        activo: true
      });
      await estadoRepository.save(estadoActivo);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario administrador
    const nuevoAdmin = usuarioRepository.create({
      nombre,
      email,
      password: hashedPassword,
      telefono: telefono || null,
      direccion: direccion || null,
      ciudad: ciudad || null,
      codigoPostal: codigoPostal || null,
      rol: adminRol,
      estado: estadoActivo
    });

    const adminGuardado = await usuarioRepository.save(nuevoAdmin);

    res.status(201).json({
      message: 'Administrador creado exitosamente',
      usuario: {
        id: adminGuardado.id,
        nombre: adminGuardado.nombre,
        email: adminGuardado.email,
        rol: adminRol.nombre
      }
    });

  } catch (error: any) {
    console.error('Error al crear primer administrador:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar si el sistema necesita configuración inicial
export const checkSetupStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userCount = await usuarioRepository.count();
    const needsSetup = userCount === 0;

    res.json({
      needsSetup,
      message: needsSetup ? 'Sistema necesita configuración inicial' : 'Sistema ya configurado'
    });

  } catch (error: any) {
    console.error('Error al verificar estado del sistema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 