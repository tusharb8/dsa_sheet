import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorController } from './vector.controller';
import { VectorService } from './vector.service';
import { Topic } from '../topic/entities/topic.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Problem } from '../problem/entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Resource, Problem])],
  controllers: [VectorController],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}
