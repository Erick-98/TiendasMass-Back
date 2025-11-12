import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Direccion } from "../entities/Direccion.entity";
import { Usuario } from "../entities/Usuario.entity";

export const obtenerDireccionesUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { usuarioId } = req.params;
        const direccionRepo = AppDataSource.getRepository(Direccion);
        
        const direcciones = await direccionRepo.find({
            where: { 
                usuarioId: parseInt(usuarioId),
                activa: true 
            },
            order: { esPrincipal: 'DESC', creadoEn: 'DESC' }
        });
        
        return res.json(direcciones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener direcciones" });
    }
};

export const obtenerDireccionPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const direccionRepo = AppDataSource.getRepository(Direccion);
        
        const direccion = await direccionRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['usuario']
        });
        
        if (!direccion) {
            return res.status(404).json({ error: "Dirección no encontrada" });
        }
        
        return res.json(direccion);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener dirección" });
    }
};

export const crearDireccion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { usuarioId, nombre, calle, ciudad, codigoPostal, pais, referencia, esPrincipal } = req.body;
        
        // Validaciones básicas
        if (!usuarioId || !nombre || !calle || !ciudad || !codigoPostal) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        
        const direccionRepo = AppDataSource.getRepository(Direccion);
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        
        // Verificar que el usuario existe
        const usuario = await usuarioRepo.findOne({ where: { id: parseInt(usuarioId) } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        // Si esta dirección será principal, desactivar las otras principales del usuario
        if (esPrincipal) {
            await direccionRepo.update(
                { usuarioId: parseInt(usuarioId), esPrincipal: true },
                { esPrincipal: false }
            );
        }
        
        const nuevaDireccion = direccionRepo.create({
            usuarioId: parseInt(usuarioId),
            nombre: nombre.trim(),
            calle: calle.trim(),
            ciudad: ciudad.trim(),
            codigoPostal: codigoPostal.trim(),
            pais: pais?.trim() || 'Perú',
            referencia: referencia?.trim() || null,
            esPrincipal: esPrincipal || false,
            activa: true
        });
        
        const direccionGuardada = await direccionRepo.save(nuevaDireccion);
        return res.status(201).json(direccionGuardada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al crear dirección" });
    }
};

export const actualizarDireccion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { nombre, calle, ciudad, codigoPostal, pais, referencia, esPrincipal } = req.body;
        
        const direccionRepo = AppDataSource.getRepository(Direccion);
        const direccion = await direccionRepo.findOne({ 
            where: { id: parseInt(id) },
            relations: ['usuario']
        });
        
        if (!direccion) {
            return res.status(404).json({ error: "Dirección no encontrada" });
        }
        
        // Si esta dirección será principal, desactivar las otras principales del usuario
        if (esPrincipal && !direccion.esPrincipal) {
            await direccionRepo.update(
                { usuarioId: direccion.usuarioId, esPrincipal: true },
                { esPrincipal: false }
            );
        }
        
        // Actualizar campos
        direccion.nombre = nombre?.trim() || direccion.nombre;
        direccion.calle = calle?.trim() || direccion.calle;
        direccion.ciudad = ciudad?.trim() || direccion.ciudad;
        direccion.codigoPostal = codigoPostal?.trim() || direccion.codigoPostal;
        direccion.pais = pais?.trim() || direccion.pais;
        direccion.referencia = referencia?.trim() || direccion.referencia;
        direccion.esPrincipal = esPrincipal !== undefined ? esPrincipal : direccion.esPrincipal;
        
        const direccionActualizada = await direccionRepo.save(direccion);
        return res.json(direccionActualizada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar dirección" });
    }
};

export const eliminarDireccion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const direccionRepo = AppDataSource.getRepository(Direccion);
        
        const direccion = await direccionRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!direccion) {
            return res.status(404).json({ error: "Dirección no encontrada" });
        }
        
        // En lugar de eliminar físicamente, marcar como inactiva
        direccion.activa = false;
        await direccionRepo.save(direccion);
        
        return res.json({ message: "Dirección eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar dirección" });
    }
};

export const establecerDireccionPrincipal = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const direccionRepo = AppDataSource.getRepository(Direccion);
        
        const direccion = await direccionRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!direccion) {
            return res.status(404).json({ error: "Dirección no encontrada" });
        }
        
        // Desactivar todas las direcciones principales del usuario
        await direccionRepo.update(
            { usuarioId: direccion.usuarioId, esPrincipal: true },
            { esPrincipal: false }
        );
        
        // Establecer esta dirección como principal
        direccion.esPrincipal = true;
        const direccionActualizada = await direccionRepo.save(direccion);
        
        return res.json(direccionActualizada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al establecer dirección principal" });
    }
}; 