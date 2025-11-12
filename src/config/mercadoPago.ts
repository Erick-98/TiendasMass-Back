import { MercadoPagoConfig, Preference } from 'mercadopago';

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN as string, // TEST-xxxx o PROD-xxxx
});

export const preferenceClient = new Preference(mp);
