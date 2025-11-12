import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Pedido } from "./Pedidos.entity";
import { Producto } from "./Producto.entity";

@Entity("Detalles_Pedidos")
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, pedido => pedido.detallesPedidos, { onDelete: "CASCADE" })
  pedido: Pedido;

  @ManyToOne(() => Producto, producto => producto.detallesPedidos)
  producto: Producto;

  @Column("int")
  cantidad: number;

  @Column("decimal", { precision: 10, scale: 2 })
  precio: number;
}
