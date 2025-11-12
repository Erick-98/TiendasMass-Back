import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByIds } from '../controllers/productos.controller';
import upload from '../middlewares/upload'; // Asegúrate que este es tu config de multer

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 👇 Aquí aplicas el middleware de multer para capturar la imagen
router.post('/', upload.single('imagen'), createProduct);

router.put('/:id', upload.single('imagen'), updateProduct); // opcional: si permites editar imagen
router.delete('/:id', deleteProduct);

router.post('/bulk', getProductsByIds);

export default router;
