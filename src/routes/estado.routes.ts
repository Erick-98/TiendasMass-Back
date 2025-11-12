import { Router } from "express";
import { 
    obtenerEstados, 
    obtenerEstadoPorId,
    crearEstado, 
    actualizarEstado, 
    eliminarEstado,
    actualizarOrdenEstados
} from "../controllers/estado.controller";

const router = Router();

// Obtener todos los estados
router.get("/", obtenerEstados);

// Obtener un estado por ID
router.get("/:id", obtenerEstadoPorId);

// Crear un nuevo estado
router.post("/", crearEstado);

// Actualizar un estado
router.put("/:id", actualizarEstado);

// Eliminar un estado
router.delete("/:id", eliminarEstado);

// Actualizar el orden de los estados
router.put("/orden/actualizar", actualizarOrdenEstados);

export default router; 