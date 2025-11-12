import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './Usuario.entity';

@Entity('Tarjetas_Usuario')
export class TarjetaUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.tarjetas, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column({ length: 20 }) // Ej: "Visa", "Mastercard"
  tipoTarjeta: string;

  @Column({ length: 19 }) // N° tarjeta enmascarado, ej: "**** **** **** 1234"
  numeroEnmascarado: string;

  @Column({ length: 5 }) // Fecha vencimiento MM/AA
  fechaVencimiento: string;

  @Column({ length: 100 }) // Nombre que aparece en la tarjeta
  nombreEnTarjeta: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
