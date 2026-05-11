import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dsa-sheet-secret',
    });
  }

  async validate(payload: { sub: number }) {
    const user = await this.users.findOne({ where: { id: payload.sub }, relations: ['roles', 'roles.rights'] });
    if (!user) throw new UnauthorizedException();
    if (user.disabled) throw new ForbiddenException('Account is disabled');
    return user;
  }
}
