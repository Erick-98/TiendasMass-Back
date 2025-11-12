import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { MetodoEnvio } from "../entities/MetodoEnvio.entity";

export const getMetodosEnvio = async (req: Request, res: Response) => {
    try {
        const metodoEnvioRepository = AppDataSource.getRepository(MetodoEnvio);
        const metodos = await metodoEnvioRepository.find();
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener métodos de envío", error });
    }
};

export const getMetodoEnvioById = async (req: Request, res: Response) => {
    try {
        const metodoEnvioRepository = AppDataSource.getRepository(MetodoEnvio);
        const metodo = await metodoEnvioRepository.findOneBy({ id: Number(req.params.id) });
        if (!metodo) {
            return res.status(404).json({ message: "Método de envío no encontrado" });
        }
        res.json(metodo);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el método de envío", error });
    }
};

export const createMetodoEnvio = async (req: Request, res: Response) => {
    try {
        const metodoEnvioRepository = AppDataSource.getRepository(MetodoEnvio);
        const nuevoMetodo = metodoEnvioRepository.create(req.body);
        await metodoEnvioRepository.save(nuevoMetodo);
        res.status(201).json(nuevoMetodo);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el método de envío", error });
    }
};

export const updateMetodoEnvio = async (req: Request, res: Response) => {
    try {
        const metodoEnvioRepository = AppDataSource.getRepository(MetodoEnvio);
        const metodo = await metodoEnvioRepository.findOneBy({ id: Number(req.params.id) });
        if (!metodo) {
            return res.status(404).json({ message: "Método de envío no encontrado" });
        }
        metodoEnvioRepository.merge(metodo, req.body);
        const resultado = await metodoEnvioRepository.save(metodo);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el método de envío", error });
    }
};

export const deleteMetodoEnvio = async (req: Request, res: Response) => {
    try {
        const metodoEnvioRepository = AppDataSource.getRepository(MetodoEnvio);
        const resultado = await metodoEnvioRepository.delete({ id: Number(req.params.id) });
        if (resultado.affected === 0) {
            return res.status(404).json({ message: "Método de envío no encontrado" });
        }
        res.json({ message: "Método de envío eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el método de envío", error });
    }
};