import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Producto } from './Producto.entity';
import { Estado } from './Estado.entity';
import { ManyToOne } from 'typeorm';

@Entity('Categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => Producto, producto => producto.categoria)
  productos: Producto[];
  
  @ManyToOne(() => Estado, estado => estado.categorias)
  estado: Estado;
}
