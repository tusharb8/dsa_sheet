import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './entities/problem.entity';
import { Topic } from '../topic/entities/topic.entity';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [TypeOrmModule.forFeature([Problem, Topic]), VectorModule],
  controllers: [ProblemController],
  providers: [ProblemService],
  exports: [ProblemService],
})
export class ProblemModule {}
