import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Problem } from '../problem/entities/problem.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly repo: Repository<Progress>,
    @InjectRepository(Problem)
    private readonly problems: Repository<Problem>,
  ) {}

  async markSolved(userId: number, problemId: number) {
    const exists = await this.repo.findOne({ where: { userId, problemId } });
    if (exists) throw new ConflictException('Already marked solved');

    const today = new Date().toISOString().slice(0, 10);
    return this.repo.save(this.repo.create({ userId, problemId, solvedDate: today }));
  }

  async getUserProgress(userId: number) {
    const records = await this.repo.find({
      where: { userId },
      relations: ['problem'],
      order: { createdAt: 'DESC' },
    });

    const totalProblems = await this.problems.count();
    return {
      solved: records.length,
      total: totalProblems,
      records,
    };
  }

  async getDailyStats(userId: number) {
    const records = await this.repo.find({
      where: { userId },
      order: { solvedDate: 'DESC' },
    });

    const daily: Record<string, number> = {};
    for (const r of records) {
      daily[r.solvedDate] = (daily[r.solvedDate] || 0) + 1;
    }

    return {
      daily,
      streak: this.calcStreak(Object.keys(daily).sort().reverse()),
    };
  }

  async resume(userId: number) {
    const solved = await this.repo.find({
      where: { userId },
      select: ['problemId'],
    });
    const solvedIds = solved.map((s) => s.problemId);

    if (solvedIds.length === 0) {
      return this.problems.findOne({ where: {}, order: { id: 'ASC' } });
    }

    return this.problems
      .createQueryBuilder('p')
      .where('p.id NOT IN (:...solvedIds)', { solvedIds })
      .orderBy('p.id', 'ASC')
      .getOne();
  }

  private calcStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    let streak = 1;
    const today = new Date().toISOString().slice(0, 10);
    if (dates[0] !== today) return 0;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }
}
