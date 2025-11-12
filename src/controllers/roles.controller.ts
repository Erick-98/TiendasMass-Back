// controllers/rolController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source'; // Ajusta la ruta según tu estructura
import { Rol } from '../entities/Rol.entity'; // Ajusta la ruta según tu estructura

const rolRepository = AppDataSource.getRepository(Rol);

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await rolRepository.find({
      select: ['id', 'nombre'] // Solo los campos necesarios
    });
    
    res.status(200).json(roles);
  } catch (error: any) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};