import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { Topic } from '../topic/entities/topic.entity';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, Topic]), VectorModule],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
