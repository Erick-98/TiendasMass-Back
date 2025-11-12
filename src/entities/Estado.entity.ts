// src/entities/Estado.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "./Usuario.entity";
import { Producto } from "./Producto.entity";
import { Categoria } from "./Categoria.entity";

@Entity("Estados")
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ length: 7, default: '#6c757d' })
  color: string; // Color hexadecimal para el badge

  @Column({ type: 'int', default: 1 })
  orden: number; // Orden de visualización

  @Column({ type: 'boolean', default: true })
  activo: boolean; // Si el estado está activo

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.estado)
  usuarios: Usuario[];
  
  @OneToMany(() => Producto, producto => producto.estado)
  productos: Producto[];

  @OneToMany(() => Categoria, (categoria) => categoria.estado)
  categorias: Categoria[];
}
