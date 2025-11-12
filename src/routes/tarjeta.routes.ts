import { Router } from "express";
import { registrarTarjeta } from "../controllers/tarjeta.controller";

const router = Router();

router.post("/tarjetas", registrarTarjeta);

export default router;
