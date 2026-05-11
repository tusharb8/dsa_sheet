import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly repo: Repository<Topic>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { orderIndex: 'ASC' },
      relations: ['resources', 'problems'],
    });
  }

  async findOne(id: number) {
    const t = await this.repo.findOne({
      where: { id },
      relations: ['resources', 'problems'],
    });
    if (!t) throw new NotFoundException();
    return t;
  }
}
