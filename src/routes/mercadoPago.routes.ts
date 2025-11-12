import { Router } from "express";
import { crearPreferencia } from "../controllers/mercadoPago.controller";

const router = Router();
router.post("/pago", crearPreferencia); // → POST /api/pago
router.post('/webhooks/mp', (req, res) => {
  console.log('📬 Webhook MP', { query: req.query, body: req.body });
  res.sendStatus(200);
});
export default router;
