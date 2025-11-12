import { MercadoPagoConfig } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export async function crearPreferencia(items: any[]) {
  const preference = { items };
  return await mercadopago.preference.create(preference);
}
