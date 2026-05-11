import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic])],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
