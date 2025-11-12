import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Categoria } from "./Categoria.entity";
import { Estado } from "./Estado.entity";
import { DetallePedido } from "./DetallePedido.entity";
import { Reporte } from "./Reportes.entity";

@Entity("Productos")
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column("text", { nullable: true })
  descripcion: string;

  @Column("decimal", { precision: 10, scale: 2 })
  precio: number;

  @Column("int", { default: 0 })
  stock: number;

  @Column({ length: 255, nullable: true })
  marca: string;

  @Column({ length: 500, nullable: true })
  imagen: string;

  @ManyToOne(() => Categoria, categoria => categoria.productos)
  categoria: Categoria;

  @ManyToOne(() => Estado, estado => estado.productos)
  estado: Estado;

  @CreateDateColumn({ name: "creado_en" })
  creadoEn: Date;

  @UpdateDateColumn({ name: "actualizado_en" })
  actualizadoEn: Date;

  @OneToMany(() => DetallePedido, detallePedido => detallePedido.producto)
  detallesPedidos: DetallePedido[];

  @OneToMany(() => Reporte, reporte => reporte.producto)
  reportes: Reporte[];
}
