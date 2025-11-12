import { Request, Response } from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializa MercadoPago con tu token
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Controlador Express para crear una preferencia de pago
export const crearPreferencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: "Producto TiendasMass",
            quantity: 1,
            currency_id: "PEN",
            unit_price: 50,
            id: ""
          },
        ],
        back_urls: {
          success: `${process.env.FRONT_PUBLIC_URL}/success`,
          failure: `${process.env.FRONT_PUBLIC_URL}/failure`,
          pending: `${process.env.FRONT_PUBLIC_URL}/pending`,
        },
        auto_return: "approved",
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
};