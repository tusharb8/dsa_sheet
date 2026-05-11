import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Problem } from '../../problem/entities/problem.entity';

@Entity()
@Unique(['userId', 'problemId'])
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('int', { name: 'problem_id' })
  problemId: number;

  @Column({ type: 'date', name: 'solved_date' })
  solvedDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Problem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;
}
