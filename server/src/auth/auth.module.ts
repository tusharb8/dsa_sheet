import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { RightsGuard } from './rights.guard';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dsa-sheet-secret',
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([User, Role]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, RightsGuard],
  exports: [AuthService, RolesGuard, RightsGuard],
})
export class AuthModule {}
