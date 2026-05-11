import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Resource } from '../../resource/entities/resource.entity';
import { Problem } from '../../problem/entities/problem.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('int', { default: 0 })
  orderIndex: number;

  @OneToMany(() => Resource, (r) => r.topic)
  resources: Resource[];

  @OneToMany(() => Problem, (p) => p.topic)
  problems: Problem[];
}
