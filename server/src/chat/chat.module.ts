import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Topic } from '../topic/entities/topic.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Problem } from '../problem/entities/problem.entity';
import { Progress } from '../progress/entities/progress.entity';
import { User } from '../user/entities/user.entity';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Resource, Problem, Progress, User]), VectorModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
