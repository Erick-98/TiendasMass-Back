import {
  Entity,
  PrimaryGeneratedColumn,
  Column,

} from 'typeorm';


@Entity('Roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

 
}
