import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly repo: Repository<Resource>,
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
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Resource>) {
    const r = await this.findOne(id);
    Object.assign(r, data);
    return this.repo.save(r);
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }
}
