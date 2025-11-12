import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { MetodoPago } from "../entities/MetodoPago.entity";
import { Pedido } from "../entities/Pedidos.entity";

export const obtenerMetodosPago = async (req: Request, res: Response): Promise<Response> => {
    try {
        const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
        const metodosPago = await metodoPagoRepo.find({
            order: { creadoEn: 'DESC' }
        });
        return res.json(metodosPago);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener métodos de pago" });
    }
};

export const obtenerMetodoPagoPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
        const metodoPago = await metodoPagoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!metodoPago) {
            return res.status(404).json({ error: "Método de pago no encontrado" });
        }
        
        return res.json(metodoPago);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener método de pago" });
    }
};

export const crearMetodoPago = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { nombre, descripcion, comision } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es requerido" });
        }
        
        const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
        
        // Verificar si ya existe un método con el mismo nombre
        const metodoExistente = await metodoPagoRepo.findOne({ where: { nombre: nombre.trim() } });
        if (metodoExistente) {
            return res.status(400).json({ error: "Ya existe un método de pago con ese nombre" });
        }
        
        const nuevoMetodoPago = metodoPagoRepo.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || null,
            comision: comision || null
        });
        
        const metodoGuardado = await metodoPagoRepo.save(nuevoMetodoPago);
        return res.status(201).json(metodoGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al crear método de pago" });
    }
};

export const actualizarMetodoPago = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, comision } = req.body;
        
        const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
        const metodoPago = await metodoPagoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!metodoPago) {
            return res.status(404).json({ error: "Método de pago no encontrado" });
        }
        
        if (nombre && nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre no puede estar vacío" });
        }
        
        // Verificar si ya existe otro método con el mismo nombre
        if (nombre && nombre.trim() !== metodoPago.nombre) {
            const metodoExistente = await metodoPagoRepo.findOne({ where: { nombre: nombre.trim() } });
            if (metodoExistente) {
                return res.status(400).json({ error: "Ya existe un método de pago con ese nombre" });
            }
        }
        
        metodoPago.nombre = nombre?.trim() || metodoPago.nombre;
        metodoPago.descripcion = descripcion?.trim() || metodoPago.descripcion;
        metodoPago.comision = comision !== undefined ? comision : metodoPago.comision;
        
        const metodoActualizado = await metodoPagoRepo.save(metodoPago);
        return res.json(metodoActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar método de pago" });
    }
};

export const eliminarMetodoPago = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
        const pedidoRepo = AppDataSource.getRepository(Pedido);
        
        const metodoPago = await metodoPagoRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!metodoPago) {
            return res.status(404).json({ error: "Método de pago no encontrado" });
        }
        
        // Verificar si hay pedidos que usen este método de pago
        const pedidosConMetodo = await pedidoRepo.count({ where: { metodoPago: { id: parseInt(id) } } });
        if (pedidosConMetodo > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el método de pago porque está siendo utilizado por pedidos existentes" 
            });
        }
        
        await metodoPagoRepo.remove(metodoPago);
        return res.json({ message: "Método de pago eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar método de pago" });
    }
};
