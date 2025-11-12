import { Router } from "express";
import { 
    obtenerTarjetasUsuario,
    obtenerTarjetaPorId,
    crearTarjeta, 
    actualizarTarjeta, 
    eliminarTarjeta
} from "../controllers/tarjeta-usuario.controller";

const router = Router();

// Obtener tarjetas de un usuario
router.get("/usuario/:usuarioId", obtenerTarjetasUsuario);

// Obtener una tarjeta por ID
router.get("/:id", obtenerTarjetaPorId);

// Crear una nueva tarjeta
router.post("/", crearTarjeta);

// Actualizar una tarjeta
router.put("/:id", actualizarTarjeta);

// Eliminar una tarjeta
router.delete("/:id", eliminarTarjeta);

export default router; 