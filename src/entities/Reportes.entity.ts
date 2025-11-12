import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Pedido } from "./Pedidos.entity";
import { Producto } from "./Producto.entity";
import { Usuario } from "./Usuario.entity";

@Entity("Reportes")
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  tipoReporte: string;

  @CreateDateColumn({ name: "generado_en" })
  generadoEn: Date;

  @Column("text", { nullable: true })
  contenido: string;

  @ManyToOne(() => Pedido, pedido => pedido.reportes, { nullable: true })
  pedido: Pedido | null;

  @ManyToOne(() => Producto, producto => producto.reportes, { nullable: true })
  producto: Producto | null;

  @ManyToOne(() => Usuario, usuario => usuario.reportes, { nullable: true })
  usuario: Usuario | null;
}
