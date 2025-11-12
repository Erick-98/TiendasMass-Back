import { Preference } from 'mercadopago';
import type { Request, Response, NextFunction } from 'express';
import { preferenceClient } from '../config/mercadoPago';

type MpItem = {
  title: string;
  quantity: number;
  currency_id?: 'PEN' | 'USD' | 'ARS' | string;
  unit_price: number;
};

type CreatePrefBody = { 
  items: MpItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
};

export async function crearPreferencia(
  req: Request<unknown, unknown, CreatePrefBody>,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('📦 Creando preferencia MP con:', req.body);

    // 1) Validar y normalizar items
    const items = (req.body?.items ?? []).map((i) => ({
      title: String(i.title || 'Producto'),
      quantity: Number(i.quantity) || 1,
      currency_id: String(i.currency_id || 'PEN'),
      unit_price: Number(i.unit_price) || 0,
    }));

    if (!items.length) {
      return res.status(400).json({ 
        success: false,
        message: 'Se requiere al menos un item' 
      });
    }

    // Validar que los precios sean válidos
    const invalidItems = items.filter(i => i.unit_price <= 0);
    if (invalidItems.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los items deben tener un precio válido mayor a 0' 
      });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(500).json({ 
        success: false,
        message: 'MP_ACCESS_TOKEN no configurado en el servidor' 
      });
    }

    // 2) Configurar URLs
    const frontBase = process.env.FRONT_PUBLIC_URL || 'http://localhost:5173';
    const publicBase = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 443}`;

    const backUrls = {
      success: `${frontBase}/checkout?status=success`,
      pending: `${frontBase}/checkout?status=pending`,
      failure: `${frontBase}/checkout?status=failure`,
    };

    console.log('🔗 URLs configuradas:', {
      back_urls: backUrls,
      notification_url: `${publicBase}/api/webhooks/mp`,
    });

    // 3) Crear preferencia con configuración mejorada
    const preferenceData: any = {
      items,
      back_urls: backUrls,
      // auto_return: 'approved', // ❌ DESACTIVADO: No funciona con localhost, requiere HTTPS público
      notification_url: `${publicBase}/api/webhooks/mp`,
      statement_descriptor: 'TIENDAS MASS', // Nombre en el resumen de tarjeta
      external_reference: `ORDER-${Date.now()}`, // Referencia única
    };

    // Agregar información del comprador si está disponible
    if (req.body.payer) {
      preferenceData.payer = req.body.payer;
    }

    const pref = await preferenceClient.create({
      body: preferenceData,
    });

    console.log('✅ Preferencia creada:', {
      id: pref.id,
      has_init_point: !!pref.init_point,
      has_sandbox: !!pref.sandbox_init_point,
    });

    // 4) Respuesta al frontend
    return res.json({
      success: true,
      id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
      // Usar sandbox si el token es TEST
      checkout_url: process.env.MP_ACCESS_TOKEN?.startsWith('TEST-') 
        ? pref.sandbox_init_point 
        : pref.init_point,
    });
  } catch (err: any) {
    console.error('❌ Error al crear preferencia MP:', {
      message: err?.message,
      cause: err?.cause,
      response: err?.response?.data,
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear preferencia de pago',
      detail: err?.message || 'Error desconocido',
      // Solo en desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          cause: err?.cause,
          response: err?.response?.data,
        }
      })
    });
  }
}
