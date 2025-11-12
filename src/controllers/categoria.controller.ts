import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source'; // Ajusta la ruta según tu configuración
import { Categoria } from '../entities/Categoria.entity'; // Ajusta la ruta según tu estructura
import { Estado } from '../entities/Estado.entity';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryRepository = AppDataSource.getRepository(Categoria);
    // Incluir relaciones para que el frontend pueda leer productos y estado
    const categories = await categoryRepository.find({ relations: ['productos', 'estado'] });
    res.json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: errorMessage });
  }
};

// Opcional: Otros métodos CRUD que podrías necesitar
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryRepository = AppDataSource.getRepository(Categoria);
    const category = await categoryRepository.findOne({ 
      where: { id: parseInt(id) },
      relations: ['productos', 'estado'] // Incluye los productos y el estado relacionados
    });
    
    if (!category) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }
    
    res.json(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: errorMessage });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const categoryRepository = AppDataSource.getRepository(Categoria);
  const estadoRepository = AppDataSource.getRepository(Estado);

    // Resolver relación de estado: el frontend envía 'true'/'false' o booleano
    let estadoEntity: any = undefined;
    try {
      const estadoBool = estado === 'true' || estado === true || estado === '1' || estado === 1;
      const estadoNombre = estadoBool ? 'Activo' : 'Inactivo';
      estadoEntity = await estadoRepository.findOne({ where: { nombre: estadoNombre } });
      // Si no existe el estado con ese nombre, intentar usar cualquier estado disponible
      if (!estadoEntity) {
        estadoEntity = await estadoRepository.findOne({});
      }
      // Si aún no hay estados en la base, crear uno por defecto (Activo/Inactivo según lo solicitado)
      if (!estadoEntity) {
        const newEstado = estadoRepository.create({
          nombre: estadoNombre,
          descripcion: undefined,
          color: estadoBool ? '#28a745' : '#6c757d',
          orden: 1,
          activo: true
        });
        estadoEntity = await estadoRepository.save(newEstado);
      }
    } catch (e) {
      // noop
    }

    const newCategory = categoryRepository.create({
      nombre,
      descripcion,
      estado: estadoEntity as Estado
    });

  const savedCategory = await categoryRepository.save(newCategory);
  const savedWithRelations = await categoryRepository.findOne({ where: { id: savedCategory.id }, relations: ['productos', 'estado'] });
  res.status(201).json(savedWithRelations || savedCategory);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: errorMessage });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;
    const categoryRepository = AppDataSource.getRepository(Categoria);
  const estadoRepository = AppDataSource.getRepository(Estado);

    const category = await categoryRepository.findOne({ where: { id: parseInt(id) }, relations: ['estado', 'productos'] });
    
    if (!category) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }
    
    category.nombre = nombre ?? category.nombre;
    category.descripcion = descripcion ?? category.descripcion;

    if (typeof estado !== 'undefined') {
      // Mapear el valor recibido (booleano o string) a la entidad Estado
      const estadoBool = estado === 'true' || estado === true || estado === '1' || estado === 1;
      const estadoNombre = estadoBool ? 'Activo' : 'Inactivo';
      const estadoEntity = await estadoRepository.findOne({ where: { nombre: estadoNombre } });
      if (estadoEntity) {
        category.estado = estadoEntity as Estado;
      }
    }
    
    const updatedCategory = await categoryRepository.save(category);
    // Devolver con relaciones para que el frontend vea productos y estado actualizado
    const categoryWithRelations = await categoryRepository.findOne({ where: { id: updatedCategory.id }, relations: ['productos', 'estado'] });
    res.json(categoryWithRelations || updatedCategory);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: errorMessage });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryRepository = AppDataSource.getRepository(Categoria);
    
    const category = await categoryRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!category) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }
    
    await categoryRepository.remove(category);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: errorMessage });
  }
};