import { Router } from "express";
import { obtenerEstadisticasDashboard } from "../controllers/dashboard.controller";

const router = Router();

// Obtener estadísticas del dashboard
router.get("/estadisticas", obtenerEstadisticasDashboard);

export default router; 