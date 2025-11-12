import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario.entity';
import fs from 'fs';
import path from 'path';

const privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.key'), 'utf8');
const usuarioRepository = AppDataSource.getRepository(Usuario);

// Login general (para usuarios y administradores)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const usuario = await usuarioRepository.findOne({
      where: { email },
      relations: ['estado', 'rol'],
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el usuario está activo
    if (usuario.estado?.nombre?.toLowerCase() !== 'activo') {
      res.status(401).json({ error: 'Usuario inactivo o suspendido' });
      return;
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol?.nombre
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '24h'
      }
    );

    res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        direccion: usuario.direccion || "",
        telefono: usuario.telefono,
        ciudad: usuario.ciudad,
        codigoPostal: usuario.codigoPostal,
        estado: usuario.estado,
        rol: usuario.rol
      },
      token: token,
      expiresIn: '24h'
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login específico para administradores
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const usuario = await usuarioRepository.findOne({
      where: { email },
      relations: ['estado', 'rol'],
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el usuario está activo
    if (usuario.estado?.nombre?.toLowerCase() !== 'activo') {
      res.status(401).json({ error: 'Usuario inactivo o suspendido' });
      return;
    }

    // Verificar si el usuario es administrador
    const rolNombre = usuario.rol?.nombre?.toLowerCase();
    if (!rolNombre || (!rolNombre.includes('admin') && !rolNombre.includes('administrador'))) {
      res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
      return;
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // Crear token JWT para administrador
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol?.nombre,
        isAdmin: true
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '24h'
      }
    );

    res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        direccion: usuario.direccion || "",
        telefono: usuario.telefono,
        ciudad: usuario.ciudad,
        codigoPostal: usuario.codigoPostal,
        estado: usuario.estado,
        rol: usuario.rol
      },
      token: token,
      expiresIn: '24h'
    });

  } catch (error: any) {
    console.error('Error en admin login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar token
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticación requerido' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, privateKey) as any;

    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    const usuario = await usuarioRepository.findOne({
      where: { id: decoded.userId },
      relations: ['estado', 'rol'],
    });

    if (!usuario) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        direccion: usuario.direccion || "",
        telefono: usuario.telefono,
        ciudad: usuario.ciudad,
        codigoPostal: usuario.codigoPostal,
        estado: usuario.estado,
        rol: usuario.rol
      },
      isValid: true
    });

  } catch (error: any) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}; 