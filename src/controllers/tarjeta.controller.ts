import { Request, Response } from "express";
import { crearTarjeta } from "../services/tarjeta.service";

export const registrarTarjeta = async (req: Request, res: Response) => {
  try {
    const nuevaTarjeta = await crearTarjeta(req.body);
    res.status(201).json(nuevaTarjeta);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: String(error) });
    }
  }
};
