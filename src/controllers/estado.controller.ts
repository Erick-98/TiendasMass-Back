import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Estado } from "../entities/Estado.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Producto } from "../entities/Producto.entity";
import { Categoria } from "../entities/Categoria.entity";

export const obtenerEstados = async (req: Request, res: Response): Promise<Response> => {
    try {
        const estadoRepo = AppDataSource.getRepository(Estado);
        const estados = await estadoRepo.find({
            order: { orden: 'ASC', creadoEn: 'DESC' }
        });
        return res.json(estados);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener estados" });
    }
};

export const obtenerEstadoPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const estadoRepo = AppDataSource.getRepository(Estado);
        const estado = await estadoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!estado) {
            return res.status(404).json({ error: "Estado no encontrado" });
        }
        
        return res.json(estado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener estado" });
    }
};

export const crearEstado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { nombre, descripcion, color, orden, activo } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es requerido" });
        }
        
        const estadoRepo = AppDataSource.getRepository(Estado);
        
        // Verificar si ya existe un estado con el mismo nombre
        const estadoExistente = await estadoRepo.findOne({ where: { nombre: nombre.trim() } });
        if (estadoExistente) {
            return res.status(400).json({ error: "Ya existe un estado con ese nombre" });
        }
        
        const nuevoEstado = estadoRepo.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || null,
            color: color || '#6c757d',
            orden: orden || 1,
            activo: activo !== undefined ? activo : true
        });
        
        const estadoGuardado = await estadoRepo.save(nuevoEstado);
        return res.status(201).json(estadoGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al crear estado" });
    }
};

export const actualizarEstado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, color, orden, activo } = req.body;
        
        const estadoRepo = AppDataSource.getRepository(Estado);
        const estado = await estadoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!estado) {
            return res.status(404).json({ error: "Estado no encontrado" });
        }
        
        if (nombre && nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre no puede estar vacío" });
        }
        
        // Verificar si ya existe otro estado con el mismo nombre
        if (nombre && nombre.trim() !== estado.nombre) {
            const estadoExistente = await estadoRepo.findOne({ where: { nombre: nombre.trim() } });
            if (estadoExistente) {
                return res.status(400).json({ error: "Ya existe un estado con ese nombre" });
            }
        }
        
        estado.nombre = nombre?.trim() || estado.nombre;
        estado.descripcion = descripcion?.trim() || estado.descripcion;
        estado.color = color || estado.color;
        estado.orden = orden !== undefined ? orden : estado.orden;
        estado.activo = activo !== undefined ? activo : estado.activo;
        
        const estadoActualizado = await estadoRepo.save(estado);
        return res.json(estadoActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar estado" });
    }
};

export const eliminarEstado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const estadoRepo = AppDataSource.getRepository(Estado);
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        const productoRepo = AppDataSource.getRepository(Producto);
        const categoriaRepo = AppDataSource.getRepository(Categoria);
        
        const estado = await estadoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!estado) {
            return res.status(404).json({ error: "Estado no encontrado" });
        }
        
        // Verificar si hay usuarios que usen este estado
        const usuariosConEstado = await usuarioRepo.count({ where: { estado: { id: parseInt(id) } } });
        if (usuariosConEstado > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el estado porque está siendo utilizado por usuarios existentes" 
            });
        }
        
        // Verificar si hay productos que usen este estado
        const productosConEstado = await productoRepo.count({ where: { estado: { id: parseInt(id) } } });
        if (productosConEstado > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el estado porque está siendo utilizado por productos existentes" 
            });
        }
        
        // Verificar si hay categorías que usen este estado
        const categoriasConEstado = await categoriaRepo.count({ where: { estado: { id: parseInt(id) } } });
        if (categoriasConEstado > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el estado porque está siendo utilizado por categorías existentes" 
            });
        }
        
        await estadoRepo.remove(estado);
        return res.json({ message: "Estado eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar estado" });
    }
};

export const actualizarOrdenEstados = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { estados } = req.body; // Array de { id, orden }
        
        if (!Array.isArray(estados)) {
            return res.status(400).json({ error: "Se requiere un array de estados con sus órdenes" });
        }
        
        const estadoRepo = AppDataSource.getRepository(Estado);
        
        for (const estadoData of estados) {
            const { id, orden } = estadoData;
            if (id && orden !== undefined) {
                await estadoRepo.update(id, { orden });
            }
        }
        
        // Retornar los estados actualizados
        const estadosActualizados = await estadoRepo.find({
            order: { orden: 'ASC', creadoEn: 'DESC' }
        });
        
        return res.json(estadosActualizados);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar el orden de los estados" });
    }
}; 