import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity()
export class Problem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'topic_id' })
  topicId: number;

  @Column('text')
  title: string;

  @Column('text')
  url: string;

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.MEDIUM })
  difficulty: Difficulty;

  @Column('int', { default: 0 })
  orderIndex: number;

  @ManyToOne(() => Topic, (t) => t.problems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;
}
