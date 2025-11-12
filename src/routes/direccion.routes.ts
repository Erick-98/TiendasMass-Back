import { Router } from "express";
import { 
    obtenerDireccionesUsuario,
    obtenerDireccionPorId,
    crearDireccion, 
    actualizarDireccion, 
    eliminarDireccion,
    establecerDireccionPrincipal
} from "../controllers/direccion.controller";

const router = Router();

// Obtener direcciones de un usuario
router.get("/usuario/:usuarioId", obtenerDireccionesUsuario);

// Obtener una dirección por ID
router.get("/:id", obtenerDireccionPorId);

// Crear una nueva dirección
router.post("/", crearDireccion);

// Actualizar una dirección
router.put("/:id", actualizarDireccion);

// Eliminar una dirección (marcar como inactiva)
router.delete("/:id", eliminarDireccion);

// Establecer dirección como principal
router.put("/:id/principal", establecerDireccionPrincipal);

export default router; 