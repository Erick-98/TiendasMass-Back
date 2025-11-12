import { Router } from 'express';
import { login, adminLogin, verifyToken } from '../controllers/auth.controller';

const router = Router();

// Rutas de autenticación
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/verify', verifyToken);

export default router; 