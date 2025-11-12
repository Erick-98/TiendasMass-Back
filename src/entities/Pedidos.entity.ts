import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Usuario } from "./Usuario.entity";
import { DetallePedido } from "./DetallePedido.entity";
import { MetodoEnvio } from "./MetodoEnvio.entity";
import { Reporte } from "./Reportes.entity";
import { MetodoPago } from "./MetodoPago.entity";


export enum EstadoPedido {
  PENDIENTE = "pendiente",
  CONFIRMADO = "confirmado",
  ENVIADO = "enviado",
  ENTREGADO = "entregado",
  CANCELADO = "cancelado",
}

export enum EstadoPago {
  PENDIENTE = "pendiente",
  COMPLETADO = "completado",
  FALLIDO = "fallido",
}

@Entity("Pedidos")
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.pedidos)
  usuario: Usuario;

  @Column({
    type: "enum",
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column("decimal", { precision: 10, scale: 2 })
  montoTotal: number;


  @Column("text", { nullable: true })
  direccionEnvio: string;

  @CreateDateColumn({ name: "fecha_pedido" })
  fechaPedido: Date;

  @Column({ type: "timestamp", nullable: true, name: "fecha_envio" })
  fechaEnvio: Date | null;

  @Column({
    type: "enum",
    enum: EstadoPago,
    default: EstadoPago.PENDIENTE,
    name: "estado_pago",
  })
  estadoPago: EstadoPago;

  @ManyToOne(() => MetodoPago, metodoPago => metodoPago.pedidos, { nullable: true })
  metodoPago: MetodoPago;

  @ManyToOne(() => MetodoEnvio, metodoEnvio => metodoEnvio.pedidos, { nullable: true })
  shippingMethod: MetodoEnvio | null;

  @OneToMany(() => DetallePedido, detallePedido => detallePedido.pedido, { cascade: true })
  detallesPedidos: DetallePedido[];

  @OneToMany(() => Reporte, reporte => reporte.pedido)
  reportes: Reporte[];
}
