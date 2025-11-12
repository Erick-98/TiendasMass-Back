import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Pedido } from "./Pedidos.entity";

@Entity("Metodos_Envio")
export class MetodoEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column("text", { nullable: true })
  descripcion: string;

  @Column("decimal", { precision: 10, scale: 2 })
  precio: number;

  @OneToMany(() => Pedido, pedido => pedido.shippingMethod)
  pedidos: Pedido[];
}
