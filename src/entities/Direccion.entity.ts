import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Usuario } from './Usuario.entity';

@Entity('Direcciones')
export class Direccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string; // Ej: "Casa", "Trabajo", "Oficina"

  @Column({ length: 200 })
  calle: string;

  @Column({ length: 100 })
  ciudad: string;

  @Column({ length: 20 })
  codigoPostal: string;

  @Column({ length: 100, default: 'Perú' })
  pais: string;

  @Column({ length: 100, nullable: true })
  referencia: string; // Ej: "Frente al parque", "Cerca del mall"

  @Column({ type: 'boolean', default: false })
  esPrincipal: boolean; // Si es la dirección principal del usuario

  @Column({ type: 'boolean', default: true })
  activa: boolean; // Si la dirección está activa

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @ManyToOne(() => Usuario, usuario => usuario.direcciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuarioId: number;
} 