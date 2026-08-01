import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicModule } from './topic/topic.module';
import { ResourceModule } from './resource/resource.module';
import { ProblemModule } from './problem/problem.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { RightsModule } from './rights/rights.module';
import { ProgressModule } from './progress/progress.module';
import { ChatModule } from './chat/chat.module';
import { SeedService } from './seed.service';
import { Role } from './role/entities/role.entity';
import { Right } from './rights/entities/right.entity';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forFeature([Role, Right, User]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'dsasheet',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TopicModule,
    ResourceModule,
    ProblemModule,
    UploadModule,
    UserModule,
    AuthModule,
    RoleModule,
    RightsModule,
    ProgressModule,
    ChatModule,
  ],
  providers: [SeedService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
