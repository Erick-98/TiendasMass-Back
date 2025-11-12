import { Router } from 'express';
import { getAllUsuarios, register, login, update, getUsuarioById,deleteUsuario } from '../controllers/usuarios.controller';
import { verificarToken } from '../middlewares/verificarToken';

const router = Router();

router.get('/', getAllUsuarios); // pública
router.get('/:id',  getUsuarioById); // protegida
router.post('/register', register); // pública
router.post('/login', login); // pública
router.put('/update/:id', update); // protegida
router.delete('/delete/:id', deleteUsuario); // protegida 

    // 

export default router;
