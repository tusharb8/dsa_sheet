import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Role) private roles: Repository<Role>,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  async register(email: string, password: string, name: string) {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already exists');

    const studentRole = await this.roles.findOne({ where: { name: 'STUDENT' } });
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.users.save(
      this.users.create({ email, password: hashed, name, roles: studentRole ? [studentRole] : [] }),
    );

    try {
      await this.email.sendAccountCreated(email, password, name);
      console.log(`Email sent to ${email}`);
    } catch {
      console.warn(`Email failed for ${email}`);
    }

    return this.token(user);
  }

  async adminCreateUser(email: string, password: string, name: string, roleName = 'STUDENT') {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already exists');

    const role = await this.roles.findOne({ where: { name: roleName } });
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.users.save(
      this.users.create({ email, password: hashed, name, roles: role ? [role] : [] }),
    );

    try {
      await this.email.sendAccountCreated(email, password, name);
      console.log(`Email sent to ${email}`);
    } catch {
      console.warn(`Email failed for ${email}`);
    }

    return { id: user.id, email: user.email, name: user.name, roles: [roleName] };
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.disabled) throw new ForbiddenException('Account is disabled. Contact admin.');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.token(user);
  }

  private token(user: User) {
    const payload = { sub: user.id, email: user.email, roles: user.roles.map((r) => r.name) };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles.map((r) => r.name) },
    };
  }
}
