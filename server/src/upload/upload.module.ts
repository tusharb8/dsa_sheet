import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Topic } from '../topic/entities/topic.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Problem } from '../problem/entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Resource, Problem])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
