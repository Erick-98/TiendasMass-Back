import { Request, Response } from "express"; 
import { AppDataSource } from "../config/data-source"; 
import { Pedido, EstadoPedido, EstadoPago } from "../entities/Pedidos.entity"; 
import { DetallePedido } from "../entities/DetallePedido.entity"; 
import { Usuario } from "../entities/Usuario.entity"; 
import { Producto } from "../entities/Producto.entity"; 
import { MetodoPago } from "../entities/MetodoPago.entity";
import { MetodoEnvio } from "../entities/MetodoEnvio.entity";

export const crearPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Log al inicio para ver la data recibida
    console.log('INICIO crearPedido', req.body);

    const { usuarioId, direccionEnvio, metodoPagoId, detalles, montoTotal, deliveryType, metodoEnvioId } = req.body;

    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const productoRepo = AppDataSource.getRepository(Producto);
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const detalleRepo = AppDataSource.getRepository(DetallePedido);
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const metodoEnvioRepo = AppDataSource.getRepository(MetodoEnvio);

    // Buscar usuario
    const usuario = await usuarioRepo.findOneBy({ id: usuarioId });
    console.log('Usuario encontrado:', usuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Buscar método de pago
    const metodoPago = await metodoPagoRepo.findOneBy({ id: metodoPagoId });
    console.log('Método de pago encontrado:', metodoPago);
    if (!metodoPago) return res.status(400).json({ error: "Método de pago inválido" });

    // Buscar método de envío
    const metodoEnvio = await metodoEnvioRepo.findOneBy({ id: metodoEnvioId });
    console.log('Método de envío encontrado:', metodoEnvio);
    if (!metodoEnvio) return res.status(400).json({ error: "Método de envío inválido" });

    ///////////////////////////////////////////////////
    // Calcular subtotal y verificar stock
    let subtotalCalculado = 0;
    for (const detalle of detalles) {
      const producto = await productoRepo.findOneBy({ id: detalle.productoId });
      console.log('Producto encontrado:', producto);
      if (!producto || producto.stock < detalle.cantidad) {
        return res.status(400).json({ error: `Producto sin stock o inválido (ID ${detalle.productoId})` });
      }
      subtotalCalculado += producto.precio * detalle.cantidad;
      producto.stock -= detalle.cantidad;
      await productoRepo.save(producto);
    }

    // Calcular impuestos y envío (8% de impuestos + precio real del método de envío)
    const impuestos = +(subtotalCalculado * 0.08).toFixed(2);
    const envio = metodoEnvio.precio;
    console.log('Precio de envío usado en backend:', envio);
    // Calcular comisión del método de pago
    const base = subtotalCalculado + impuestos + envio;
    let porcentaje = 0;
    if (metodoPago && metodoPago.comision != null) {
      porcentaje = Number(metodoPago.comision) / 100;
    }
    const comision = Math.round(base * porcentaje * 100) / 100;
    // Sumar la comisión al monto esperado
    const montoEsperado = Math.round((subtotalCalculado + impuestos + envio + comision) * 100) / 100;

    // LOG para depuración antes de la validación del monto
    console.log({
      subtotalCalculado,
      impuestos,
      envio,
      comision,
      montoEsperado,
      montoTotalRecibido: montoTotal,
      deliveryType,
      metodoPagoComision: metodoPago.comision
    });

    // Validar que el monto recibido del frontend coincida con lo esperado
    if (Math.abs(montoTotal - montoEsperado) > 0.01) {
      return res.status(400).json({
        error: `El monto total enviado (${montoTotal}) no coincide con el calculado (${montoEsperado}).`,
      });
    }
    ///////////////////////////////////////////////////

    // Crear pedido
    const nuevoPedido = pedidoRepo.create({
      usuario,
      direccionEnvio,
      metodoPago,
      shippingMethod: metodoEnvio,
      estado: EstadoPedido.PENDIENTE,
      montoTotal,
      estadoPago: EstadoPago.PENDIENTE,
      fechaEnvio: null,
    });

    const pedidoGuardado = await pedidoRepo.save(nuevoPedido);
    console.log('Pedido creado con ID:', pedidoGuardado.id);

    // Crear detalles de pedido
    for (const detalle of detalles) {
      const producto = await productoRepo.findOneBy({ id: detalle.productoId });
      console.log('Detalle de producto encontrado:', producto);
      if (!producto) {
        return res.status(400).json({ error: `Producto con ID ${detalle.productoId} no encontrado` });
      }
      const nuevoDetalle = detalleRepo.create({
        pedido: pedidoGuardado,
        producto,
        cantidad: detalle.cantidad,
        precio: producto.precio,
      });
      await detalleRepo.save(nuevoDetalle);
    }

    return res.status(201).json({ mensaje: "Pedido creado con éxito", pedidoId: pedidoGuardado.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el pedido" });
  }
};


export const obtenerPedidos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedidos = await pedidoRepo.find({
      relations: [
        "usuario",
        "detallesPedidos",
        "detallesPedidos.producto",
        "metodoPago",
        "shippingMethod" // Agregado para incluir el tipo de envío
      ],
    });
    return res.json(pedidos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

export const obtenerPedidoPorId = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOne({
      where: { id: parseInt(id) },
      relations: [
        "usuario",
        "detallesPedidos",
        "detallesPedidos.producto",
        "metodoPago",
        "shippingMethod" // Agregado para incluir el tipo de envío
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    return res.json(pedido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el pedido" });
  }
};

export const actualizarEstadoPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOneBy({ id: parseInt(id) });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    pedido.estado = estado;
    const pedidoActualizado = await pedidoRepo.save(pedido);

    return res.json(pedidoActualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar el estado del pedido" });
  }
};

export const eliminarPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOneBy({ id: parseInt(id) });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    await pedidoRepo.remove(pedido);
    return res.json({ mensaje: "Pedido eliminado con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el pedido" });
  }
};

export const obtenerPedidosPorUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { usuarioId } = req.params;
    
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    // Verificar que el usuario existe
    const usuario = await usuarioRepo.findOneBy({ id: parseInt(usuarioId) });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener pedidos del usuario con todas las relaciones necesarias
    const pedidos = await pedidoRepo.find({
      where: { usuario: { id: parseInt(usuarioId) } },
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago"],
      order: { id: "DESC" } // Ordenar por ID más reciente primero
    });

    return res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      },
      pedidos: pedidos
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener los pedidos del usuario" });
  }
};

export const obtenerEstadisticasPedidos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    
    // Obtener todos los pedidos con relaciones
    const pedidos = await pedidoRepo.find({
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago"],
    });

    // Calcular estadísticas
    const totalPedidos = pedidos.length;
    const ventasTotales = pedidos.reduce((sum, pedido) => sum + parseFloat(pedido.montoTotal.toString()), 0);
    
    const estadisticasPorEstado = {
      pendiente: 0,
      confirmado: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };

    pedidos.forEach(pedido => {
      estadisticasPorEstado[pedido.estado]++;
    });

    // Calcular total de artículos vendidos
    const totalArticulos = pedidos.reduce((sum, pedido) => {
      return sum + pedido.detallesPedidos.reduce((detalleSum, detalle) => detalleSum + detalle.cantidad, 0);
    }, 0);

    return res.json({
      totalPedidos,
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      estadisticasPorEstado,
      totalArticulos,
      pedidos
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas de pedidos" });
  }
};
