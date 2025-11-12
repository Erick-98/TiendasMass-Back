import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Rol } from '../entities/Rol.entity';

const rolRepository = AppDataSource.getRepository(Rol);

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await rolRepository.find({
      order: { nombre: 'ASC' }
    });

    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getRolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rol = await rolRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.json(rol);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createRol = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del rol es requerido' });
    }

    // Verificar si ya existe un rol con ese nombre
    const existingRol = await rolRepository.findOne({
      where: { nombre: nombre.trim() }
    });

    if (existingRol) {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }

    const nuevoRol = rolRepository.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    });

    const rolGuardado = await rolRepository.save(nuevoRol);

    res.status(201).json(rolGuardado);
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const rol = await rolRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    if (nombre) {
      // Verificar si ya existe otro rol con ese nombre
      const existingRol = await rolRepository.findOne({
        where: { nombre: nombre.trim(), id: parseInt(id) }
      });

      if (existingRol && existingRol.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
      }

      rol.nombre = nombre.trim();
    }

    if (descripcion !== undefined) {
      rol.descripcion = descripcion?.trim() || null;
    }

    const rolActualizado = await rolRepository.save(rol);

    res.json(rolActualizado);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rol = await rolRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar si hay usuarios usando este rol
    const { Usuario } = await import('../entities/Usuario.entity');
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuariosConRol = await usuarioRepository.count({
      where: { rol: { id: parseInt(id) } }
    });

    if (usuariosConRol > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el rol porque ${usuariosConRol} usuario(s) lo están usando` 
      });
    }

    await rolRepository.remove(rol);

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 