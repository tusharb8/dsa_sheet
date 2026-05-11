import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Progress } from './entities/progress.entity';
import { Problem } from '../problem/entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, Problem])],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
