import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role/entities/role.entity';
import { Right } from './rights/entities/right.entity';
import { User } from './user/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private roles: Repository<Role>,
    @InjectRepository(Right) private rights: Repository<Right>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.roles.count();
    if (count > 0) return;

    const viewRight = await this.rights.save(this.rights.create({ name: 'VIEW_SHEET' }));
    const solveRight = await this.rights.save(this.rights.create({ name: 'SOLVE_PROBLEM' }));
    const adminRight = await this.rights.save(this.rights.create({ name: 'ADMIN' }));
    const viewContent = await this.rights.save(this.rights.create({ name: 'VIEW_CONTENT' }));
    const addContent = await this.rights.save(this.rights.create({ name: 'ADD_CONTENT' }));
    const deleteContent = await this.rights.save(this.rights.create({ name: 'DELETE_CONTENT' }));

    const studentRole = await this.roles.save(
      this.roles.create({ name: 'STUDENT', rights: [viewRight, solveRight, viewContent] }),
    );

    const adminRole = await this.roles.save(
      this.roles.create({ name: 'ADMIN', rights: [viewRight, solveRight, adminRight, viewContent, addContent, deleteContent] }),
    );

    const hashed = await bcrypt.hash('admin123', 10);
    await this.users.save(
      this.users.create({
        email: 'admin@dsasheet.com',
        password: hashed,
        name: 'Admin',
        roles: [adminRole],
      }),
    );

    console.log('Seeded: admin@dsasheet.com / admin123');
  }
}
