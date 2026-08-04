import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from './entities/problem.entity';
import { VectorService } from '../vector/vector.service';
import { Topic } from '../topic/entities/topic.entity';
import { IndexedDoc } from '../vector/vector.service';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly repo: Repository<Problem>,
    @InjectRepository(Topic)
    private readonly topics: Repository<Topic>,
    private readonly vector: VectorService,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['topic'], order: { topicId: 'ASC', orderIndex: 'ASC' } });
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id }, relations: ['topic'] });
    if (!p) throw new NotFoundException('Problem not found');
    return p;
  }

  async create(data: Partial<Problem>) {
    const p = await this.repo.save(this.repo.create(data));
    await this.syncDoc(p, 'upsert');
    return p;
  }

  async update(id: number, data: Partial<Problem>) {
    const p = await this.findOne(id);
    Object.assign(p, data);
    const saved = await this.repo.save(p);
    await this.syncDoc(saved, 'upsert');
    return saved;
  }

  async remove(id: number) {
    const p = await this.findOne(id);
    await this.vector.removeByType('problem', id);
    return this.repo.remove(p);
  }

  private async toDoc(p: Problem): Promise<IndexedDoc> {
    const topic = await this.topics.findOne({ where: { id: p.topicId } });
    return {
      id: `problem-${p.id}`,
      type: 'problem',
      title: p.title,
      url: p.url,
      topicName: topic?.name ?? '',
      difficulty: p.difficulty,
      text: `${p.title} (${topic?.name ?? ''}) difficulty ${p.difficulty}`,
    };
  }

  private async syncDoc(p: Problem, op: 'upsert') {
    try {
      await this.vector.upsertDocs([await this.toDoc(p)]);
    } catch (e: any) {
      console.warn('[problem] vector sync failed:', e.message);
    }
  }
}
