import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { TarjetaUsuario } from "../entities/TarjetaUsuario.entity";
import { Usuario } from "../entities/Usuario.entity";

export const obtenerTarjetasUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { usuarioId } = req.params;
        const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);
        
        const tarjetas = await tarjetaRepo.find({
            where: { usuario: { id: parseInt(usuarioId) } },
            order: { creadoEn: 'DESC' }
        });
        
        return res.json(tarjetas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener tarjetas" });
    }
};

export const obtenerTarjetaPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);
        
        const tarjeta = await tarjetaRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['usuario']
        });
        
        if (!tarjeta) {
            return res.status(404).json({ error: "Tarjeta no encontrada" });
        }
        
        return res.json(tarjeta);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener tarjeta" });
    }
};

export const crearTarjeta = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { usuarioId, tipoTarjeta, numeroTarjeta, fechaVencimiento, nombreEnTarjeta } = req.body;
        
        // Validaciones básicas
        if (!usuarioId || !tipoTarjeta || !numeroTarjeta || !fechaVencimiento || !nombreEnTarjeta) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }

        // Validar formato de número de tarjeta (solo números, 13-19 dígitos)
        const numeroLimpio = numeroTarjeta.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(numeroLimpio)) {
            return res.status(400).json({ error: "Número de tarjeta inválido" });
        }

        // Validar formato de fecha (MM/AA)
        if (!/^\d{2}\/\d{2}$/.test(fechaVencimiento)) {
            return res.status(400).json({ error: "Formato de fecha inválido (MM/AA)" });
        }

        // Validar que la fecha no esté vencida
        const [mes, año] = fechaVencimiento.split('/');
        const fechaVenc = new Date(2000 + parseInt(año), parseInt(mes) - 1);
        const hoy = new Date();
        if (fechaVenc < hoy) {
            return res.status(400).json({ error: "La tarjeta está vencida" });
        }
        
        const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        
        // Verificar que el usuario existe
        const usuario = await usuarioRepo.findOne({ where: { id: parseInt(usuarioId) } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificar si la tarjeta ya existe para este usuario
        const tarjetaExistente = await tarjetaRepo.findOne({
            where: { 
                usuario: { id: parseInt(usuarioId) },
                numeroEnmascarado: `**** **** **** ${numeroLimpio.slice(-4)}`
            }
        });
        
        if (tarjetaExistente) {
            return res.status(400).json({ error: "Esta tarjeta ya está registrada" });
        }
        
        // Crear número enmascarado
        const ultimos4 = numeroLimpio.slice(-4);
        const numeroEnmascarado = `**** **** **** ${ultimos4}`;
        
        const nuevaTarjeta = tarjetaRepo.create({
            usuario: { id: parseInt(usuarioId) },
            tipoTarjeta: tipoTarjeta.trim(),
            numeroEnmascarado,
            fechaVencimiento: fechaVencimiento.trim(),
            nombreEnTarjeta: nombreEnTarjeta.trim()
        });
        
        const tarjetaGuardada = await tarjetaRepo.save(nuevaTarjeta);
        return res.status(201).json(tarjetaGuardada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al crear tarjeta" });
    }
};

export const actualizarTarjeta = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { tipoTarjeta, fechaVencimiento, nombreEnTarjeta } = req.body;
        
        const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);
        const tarjeta = await tarjetaRepo.findOne({ 
            where: { id: parseInt(id) },
            relations: ['usuario']
        });
        
        if (!tarjeta) {
            return res.status(404).json({ error: "Tarjeta no encontrada" });
        }
        
        // Validar formato de fecha si se proporciona
        if (fechaVencimiento) {
            if (!/^\d{2}\/\d{2}$/.test(fechaVencimiento)) {
                return res.status(400).json({ error: "Formato de fecha inválido (MM/AA)" });
            }
            
            const [mes, año] = fechaVencimiento.split('/');
            const fechaVenc = new Date(2000 + parseInt(año), parseInt(mes) - 1);
            const hoy = new Date();
            if (fechaVenc < hoy) {
                return res.status(400).json({ error: "La tarjeta está vencida" });
            }
        }
        
        // Actualizar campos
        if (tipoTarjeta) tarjeta.tipoTarjeta = tipoTarjeta.trim();
        if (fechaVencimiento) tarjeta.fechaVencimiento = fechaVencimiento.trim();
        if (nombreEnTarjeta) tarjeta.nombreEnTarjeta = nombreEnTarjeta.trim();
        
        const tarjetaActualizada = await tarjetaRepo.save(tarjeta);
        return res.json(tarjetaActualizada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar tarjeta" });
    }
};

export const eliminarTarjeta = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);
        
        const tarjeta = await tarjetaRepo.findOne({ where: { id: parseInt(id) } });
        
        if (!tarjeta) {
            return res.status(404).json({ error: "Tarjeta no encontrada" });
        }
        
        await tarjetaRepo.remove(tarjeta);
        
        return res.json({ message: "Tarjeta eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar tarjeta" });
    }
};

// Función auxiliar para validar número de tarjeta (algoritmo de Luhn)
export const validarNumeroTarjeta = (numero: string): boolean => {
    const numeroLimpio = numero.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(numeroLimpio)) return false;
    
    let suma = 0;
    let esPar = false;
    
    for (let i = numeroLimpio.length - 1; i >= 0; i--) {
        let digito = parseInt(numeroLimpio[i]);
        
        if (esPar) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }
        
        suma += digito;
        esPar = !esPar;
    }
    
    return suma % 10 === 0;
}; 