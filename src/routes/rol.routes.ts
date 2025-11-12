import { Router } from 'express';
import { getRoles, getRolById, createRol, updateRol, deleteRol } from '../controllers/rol.controller';
import adminAuthMiddleware from '../middleware/adminAuth.middleware';

const router = Router();

// Rutas públicas (para obtener roles)
router.get('/', getRoles);
router.get('/:id', getRolById);

// Rutas protegidas (solo para administradores)
router.post('/', adminAuthMiddleware, createRol);
router.put('/:id', adminAuthMiddleware, updateRol);
router.delete('/:id', adminAuthMiddleware, deleteRol);

export default router;