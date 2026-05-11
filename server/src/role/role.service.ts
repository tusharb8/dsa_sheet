import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['rights'] });
  }

  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id }, relations: ['rights'] });
    if (!r) throw new NotFoundException();
    return r;
  }

  async create(data: Partial<Role>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Role>) {
    const role = await this.findOne(id);
    Object.assign(role, data);
    return this.repo.save(role);
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }
}
