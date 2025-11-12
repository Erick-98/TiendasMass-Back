import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario.entity';

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const token = authHeader.substring(7); // Remover 'Bearer ' del token

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt') as any;
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id: decoded.userId },
      relations: ['rol']
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene rol de administrador
    const rolNombre = usuario.rol?.nombre?.toLowerCase();
    if (!rolNombre || (!rolNombre.includes('admin') && !rolNombre.includes('administrador'))) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
    }

    // Agregar el usuario al request para uso posterior
    (req as any).adminUser = usuario;
    next();

  } catch (error) {
    console.error('Error en middleware de autenticación admin:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default adminAuthMiddleware; 