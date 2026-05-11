import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Right {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;
}
