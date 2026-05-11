import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from './entities/problem.entity';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly repo: Repository<Problem>,
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
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Problem>) {
    const p = await this.findOne(id);
    Object.assign(p, data);
    return this.repo.save(p);
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }
}
