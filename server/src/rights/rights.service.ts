import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Right } from './entities/right.entity';

@Injectable()
export class RightsService {
  constructor(
    @InjectRepository(Right)
    private readonly repo: Repository<Right>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }

  async create(data: Partial<Right>) {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }
}
