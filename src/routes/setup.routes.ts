import { Router } from 'express';
import { createFirstAdmin, checkSetupStatus } from '../controllers/setup.controller';

const router = Router();

// Rutas de configuración inicial (sin autenticación)
router.get('/status', checkSetupStatus);
router.post('/create-admin', createFirstAdmin);

export default router; 