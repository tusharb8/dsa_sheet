import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Right } from '../../rights/entities/right.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @ManyToMany(() => Right)
  @JoinTable({ name: 'role_rights' })
  rights: Right[];

  @ManyToMany(() => User, (u) => u.roles)
  users: User[];
}
