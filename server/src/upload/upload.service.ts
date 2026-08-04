import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Topic } from '../topic/entities/topic.entity';
import { Resource, ResourceType } from '../resource/entities/resource.entity';
import { Problem, Difficulty } from '../problem/entities/problem.entity';
import { VectorService } from '../vector/vector.service';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Topic) private topics: Repository<Topic>,
    @InjectRepository(Resource) private resources: Repository<Resource>,
    @InjectRepository(Problem) private problems: Repository<Problem>,
    private readonly vector: VectorService,
  ) {}

  async process(file: Express.Multer.File) {
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    const seen = new Map<string, Topic>();
    let lastName = '';

    for (const row of rows) {
      const name = (row['Topic'] || row['topic'] || '').toString().trim() || lastName;
      lastName = name;
      if (!name) continue;

      if (!seen.has(name)) {
        const existing = await this.topics.findOne({ where: { name } });
        seen.set(name, existing ?? await this.topics.save(this.topics.create({ name })));
      }
      const topic = seen.get(name)!;

      const theoryUrl = (row['Theory Link'] || row['theory_link'] || row['Theory'] || '').toString().trim();
      if (theoryUrl) {
        const dup = await this.resources.findOne({ where: { topicId: topic.id, url: theoryUrl } });
        if (!dup) {
          await this.resources.save(this.resources.create({
            topicId: topic.id,
            title: this.label(theoryUrl, name),
            url: theoryUrl,
            type: theoryUrl.includes('youtube') || theoryUrl.includes('youtu.be') ? ResourceType.VIDEO : ResourceType.ARTICLE,
          }));
        }
      }

      const problemUrl = (row['Problem Link'] || row['problem_link'] || row['Problem'] || '').toString().trim();
      if (problemUrl) {
        const dup = await this.problems.findOne({ where: { topicId: topic.id, url: problemUrl } });
        if (!dup) {
          await this.problems.save(this.problems.create({
            topicId: topic.id,
            title: this.problemLabel(problemUrl),
            url: problemUrl,
            difficulty: this.diff(row['Difficulty'] || row['difficulty']),
          }));
        }
      }
    }

    await this.vector.reindexAll().catch((e) => console.warn('[upload] vector reindex failed:', e.message));

    return { ok: true, topics: seen.size };
  }

  private label(url: string, topic: string) {
    if (url.includes('youtube')) return `${topic} - Video`;
    if (url.includes('geeksforgeeks')) return `${topic} - GfG`;
    if (url.includes('takeuforward')) return `${topic} - TUF`;
    return `${topic} - Resource`;
  }

  private problemLabel(url: string) {
    const m = url.match(/problems\/([^/?#]+)/);
    return m ? m[1].replace(/-/g, ' ') : 'Problem';
  }

  private diff(v: string): Difficulty {
    const s = (v || '').toLowerCase();
    if (s.includes('easy')) return Difficulty.EASY;
    if (s.includes('hard')) return Difficulty.HARD;
    return Difficulty.MEDIUM;
  }
}
