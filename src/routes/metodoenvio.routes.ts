import express from 'express';
import {
  getMetodosEnvio,
  getMetodoEnvioById,
  createMetodoEnvio,
  updateMetodoEnvio,
  deleteMetodoEnvio
} from '../controllers/metodoenvio.controller';

const router = express.Router();
router.get('/', getMetodosEnvio);
router.get('/:id', getMetodoEnvioById);         
router.post('/', createMetodoEnvio);
router.put('/:id', updateMetodoEnvio);
router.delete('/:id', deleteMetodoEnvio);

export default router;
