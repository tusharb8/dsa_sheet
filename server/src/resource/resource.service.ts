import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { VectorService } from '../vector/vector.service';
import { Topic } from '../topic/entities/topic.entity';
import { IndexedDoc } from '../vector/vector.service';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly repo: Repository<Resource>,
    @InjectRepository(Topic)
    private readonly topics: Repository<Topic>,
    private readonly vector: VectorService,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['topic'], order: { topicId: 'ASC', orderIndex: 'ASC' } });
  }

  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id }, relations: ['topic'] });
    if (!r) throw new NotFoundException('Resource not found');
    return r;
  }

  async create(data: Partial<Resource>) {
    const r = await this.repo.save(this.repo.create(data));
    await this.syncDoc(r, 'upsert');
    return r;
  }

  async update(id: number, data: Partial<Resource>) {
    const r = await this.findOne(id);
    Object.assign(r, data);
    const saved = await this.repo.save(r);
    await this.syncDoc(saved, 'upsert');
    return saved;
  }

  async remove(id: number) {
    const r = await this.findOne(id);
    await this.vector.removeByType('resource', id);
    return this.repo.remove(r);
  }

  private async toDoc(r: Resource): Promise<IndexedDoc> {
    const topic = await this.topics.findOne({ where: { id: r.topicId } });
    return {
      id: `resource-${r.id}`,
      type: 'resource',
      title: r.title,
      url: r.url,
      topicName: topic?.name ?? '',
      text: `${r.title} (${topic?.name ?? ''}) ${r.type}`,
    };
  }

  private async syncDoc(r: Resource, op: 'upsert') {
    try {
      await this.vector.upsertDocs([await this.toDoc(r)]);
    } catch (e: any) {
      console.warn('[resource] vector sync failed:', e.message);
    }
  }
}
