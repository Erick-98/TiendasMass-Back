import { Router } from "express";
import { 
    obtenerMetodosPago, 
    obtenerMetodoPagoPorId,
    crearMetodoPago, 
    actualizarMetodoPago, 
    eliminarMetodoPago 
} from "../controllers/metodopago.controller";

const router = Router();

// Obtener todos los métodos de pago
router.get("/", obtenerMetodosPago);

// Obtener un método de pago por ID
router.get("/:id", obtenerMetodoPagoPorId);

// Crear un nuevo método de pago
router.post("/", crearMetodoPago);

// Actualizar un método de pago
router.put("/:id", actualizarMetodoPago);

// Eliminar un método de pago
router.delete("/:id", eliminarMetodoPago);

export default router;
