import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Pedido, EstadoPago,EstadoPedido } from "../entities/Pedidos.entity";
import { TarjetaUsuario } from "../entities/TarjetaUsuario.entity";

export const pagarPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { pedidoId, usuarioId, datosTarjeta } = req.body;

    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);

    // Buscar el pedido
    const pedido = await pedidoRepo.findOne({
      where: { id: pedidoId },
      relations: ["usuario", "metodoPago"]
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (pedido.usuario.id !== usuarioId) {
      return res.status(403).json({ error: "No tienes permiso para pagar este pedido" });
    }

    if (pedido.estadoPago !== EstadoPago.PENDIENTE) {
      return res.status(400).json({ error: "Este pedido ya fue pagado o falló el pago" });
    }

    // Simulación de validación de tarjeta
    if (datosTarjeta) {
      const { tipoTarjeta, numero, fechaVencimiento, nombreEnTarjeta } = datosTarjeta;

      // Simular validación (aquí puedes añadir lógica más avanzada si deseas)
      if (!numero || !fechaVencimiento || !nombreEnTarjeta) {
        return res.status(400).json({ error: "Datos de tarjeta incompletos" });
      }

      // Enmascarar número de tarjeta
      const numeroEnmascarado = "**** **** **** " + numero.slice(-4);

      // Guardar tarjeta si deseas
      const nuevaTarjeta = tarjetaRepo.create({
        usuario: pedido.usuario,
        tipoTarjeta,
        numeroEnmascarado,
        fechaVencimiento,
        nombreEnTarjeta
      });

      await tarjetaRepo.save(nuevaTarjeta);
    }

    // Cambiar estado de pago a COMPLETADO (simulado)
    pedido.estadoPago = EstadoPago.COMPLETADO;
    pedido.estado = EstadoPedido.CONFIRMADO;
    await pedidoRepo.save(pedido);

    return res.json({ mensaje: "Pago realizado con éxito", pedidoId: pedido.id });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al procesar el pago" });
  }
};
