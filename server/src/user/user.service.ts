import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly email: EmailService,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['roles'] });
  }

  async findOne(id: number) {
    const u = await this.repo.findOne({ where: { id }, relations: ['roles'] });
    if (!u) throw new NotFoundException();
    return u;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, relations: ['roles'] });
  }

  async findByRole(roleName: string) {
    return this.repo.find({
      relations: ['roles'],
      where: { roles: { name: roleName } },
    });
  }

  async create(data: Partial<User>) {
    const plainPassword = data.password;
    if (plainPassword) {
      data.password = await bcrypt.hash(plainPassword, 10);
    }
    const user = await this.repo.save(this.repo.create(data));
    if (plainPassword) {
      try {
        await this.email.sendAccountCreated(user.email, plainPassword, user.name);
        console.log(`Email sent to ${user.email}`);
      } catch {
        console.warn(`Email failed for ${user.email}`);
      }
    }
    return user;
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }

  async toggleDisabled(id: number) {
    const user = await this.findOne(id);
    user.disabled = !user.disabled;
    return this.repo.save(user);
  }

  async changePassword(id: number, newPassword: string) {
    const user = await this.findOne(id);
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.repo.save(user);
    return { id: user.id, email: user.email, name: user.name };
  }
}
