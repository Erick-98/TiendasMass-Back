import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Pedido } from "../entities/Pedidos.entity";
import { Producto } from "../entities/Producto.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Categoria } from "../entities/Categoria.entity";

export const obtenerEstadisticasDashboard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const productoRepo = AppDataSource.getRepository(Producto);
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const categoriaRepo = AppDataSource.getRepository(Categoria);

    // Obtener datos básicos
    const totalProductos = await productoRepo.count();
    const totalUsuarios = await usuarioRepo.count();
    const totalCategorias = await categoriaRepo.count();

    // Obtener pedidos con relaciones
    const pedidos = await pedidoRepo.find({
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago"],
      order: { fechaPedido: "DESC" }
    });

    // Estadísticas de pedidos
    const totalPedidos = pedidos.length;
    const ventasTotales = pedidos.reduce((sum, pedido) => sum + parseFloat(pedido.montoTotal.toString()), 0);
    
    // Pedidos de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const pedidosHoy = pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fechaPedido);
      fechaPedido.setHours(0, 0, 0, 0);
      return fechaPedido.getTime() === hoy.getTime();
    });

    // Pedidos del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const pedidosMes = pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fechaPedido);
      return fechaPedido >= inicioMes;
    });

    const ventasMes = pedidosMes.reduce((sum, pedido) => sum + parseFloat(pedido.montoTotal.toString()), 0);

    // Estadísticas por estado
    const estadisticasPorEstado = {
      pendiente: 0,
      confirmado: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };

    pedidos.forEach(pedido => {
      if (estadisticasPorEstado.hasOwnProperty(pedido.estado)) {
        estadisticasPorEstado[pedido.estado]++;
      }
    });

    // Productos más vendidos
    interface ProductoVendido {
      id: number;
      nombre: string;
      cantidadVendida: number;
      ingresos: number;
    }
    const productosVendidos: { [key: number]: ProductoVendido } = {};
    pedidos.forEach(pedido => {
      pedido.detallesPedidos.forEach(detalle => {
        const productoId = detalle.producto.id;
        const productoNombre = detalle.producto.nombre;
        const cantidad = detalle.cantidad;
        const precio = parseFloat(detalle.precio.toString());
        const subtotal = cantidad * precio;

        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            id: productoId,
            nombre: productoNombre,
            cantidadVendida: 0,
            ingresos: 0
          };
        }
        productosVendidos[productoId].cantidadVendida += cantidad;
        productosVendidos[productoId].ingresos += subtotal;
      });
    });

    const topProductos = Object.values(productosVendidos)
      .sort((a: any, b: any) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5)
      .map((producto: any) => ({
        nombre: producto.nombre,
        vendidos: producto.cantidadVendida,
        ingresos: parseFloat(producto.ingresos.toFixed(2))
      }));

    // Pedidos recientes (últimos 5)
    const pedidosRecientes = pedidos.slice(0, 5).map(pedido => ({
      id: pedido.id,
      cliente: pedido.usuario?.nombre || 'N/A',
      total: parseFloat(pedido.montoTotal.toString()),
      estado: pedido.estado,
      fecha: pedido.fechaPedido
    }));

    // Calcular cambios porcentuales (simulado para este ejemplo)
    // En un caso real, compararías con el mes anterior
    const cambioProductos = '+12%'; // Simulado
    const cambioUsuarios = '+8%'; // Simulado
    const cambioPedidosHoy = pedidosHoy.length > 0 ? `+${pedidosHoy.length * 10}%` : '0%'; // Simulado
    const cambioVentasMes = ventasMes > 0 ? '+15%' : '-3%'; // Simulado

    return res.json({
      estadisticas: {
        totalProductos,
        totalUsuarios,
        totalPedidos,
        pedidosHoy: pedidosHoy.length,
        ventasTotales: parseFloat(ventasTotales.toFixed(2)),
        ventasMes: parseFloat(ventasMes.toFixed(2))
      },
      cambios: {
        productos: cambioProductos,
        usuarios: cambioUsuarios,
        pedidosHoy: cambioPedidosHoy,
        ventasMes: cambioVentasMes
      },
      estadisticasPorEstado,
      topProductos,
      pedidosRecientes
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas del dashboard" });
  }
}; 