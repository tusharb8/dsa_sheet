import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

export enum ResourceType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
}

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'topic_id' })
  topicId: number;

  @Column('text')
  title: string;

  @Column('text')
  url: string;

  @Column({ type: 'enum', enum: ResourceType, default: ResourceType.ARTICLE })
  type: ResourceType;

  @Column('int', { default: 0 })
  orderIndex: number;

  @ManyToOne(() => Topic, (t) => t.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;
}
