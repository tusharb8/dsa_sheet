import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ChatOllama } from '@langchain/ollama';
import { tool } from '@langchain/core/tools';
import {
  BaseMessage,
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Topic } from '../topic/entities/topic.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Problem } from '../problem/entities/problem.entity';
import { Progress } from '../progress/entities/progress.entity';
import { User } from '../user/entities/user.entity';
import { ChatHistoryItem } from './dto/chat.dto';

const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const MAX_ITER = 8;

type ToolFn = (args: any) => Promise<unknown>;

interface ToolSet {
  bindTools: any[];
  executors: Record<string, ToolFn>;
}

@Injectable()
export class ChatService {
  private readonly model: ChatOllama;

  constructor(
    @InjectRepository(Topic) private readonly topics: Repository<Topic>,
    @InjectRepository(Resource) private readonly resources: Repository<Resource>,
    @InjectRepository(Problem) private readonly problems: Repository<Problem>,
    @InjectRepository(Progress) private readonly progress: Repository<Progress>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    this.model = new ChatOllama({
      baseUrl: BASE_URL,
      model: MODEL,
      temperature: 0,
    });
  }

  async status() {
    try {
      const res = await fetch(`${BASE_URL}/api/tags`);
      if (!res.ok) return { ok: false, model: MODEL };
      const data = (await res.json()) as { models: { name: string }[] };
      return { ok: true, model: MODEL, available: data.models.map((m) => m.name) };
    } catch {
      return { ok: false, model: MODEL };
    }
  }

  async chat(user: User, message: string, history: ChatHistoryItem[] = []) {
    const { bindTools, executors } = this.buildTools(user);
    const messages: BaseMessage[] = [
      new SystemMessage(this.systemPrompt(user)),
      ...history.map((h) =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content),
      ),
      new HumanMessage(message),
    ];

    let msgs = messages;
    for (let i = 0; i < MAX_ITER; i++) {
      const response = await this.invoke(msgs, bindTools);
      msgs = [...msgs, response];

      if (response.tool_calls?.length) {
        for (const call of response.tool_calls) {
          const result = await this.execute(executors, call.name, call.args);
          msgs = [...msgs, new ToolMessage(result, call.id ?? `call_${call.name}`)];
        }
        continue;
      }

      const embedded = this.extractEmbeddedToolCalls(response.content);
      if (embedded.length) {
        for (const call of embedded) {
          const result = await this.execute(executors, call.name, call.args);
          msgs = [...msgs, new ToolMessage(result, `call_${call.name}`)];
        }
        continue;
      }

      return { reply: this.contentToString(response.content) };
    }

    return { reply: 'I could not finish answering. Please try again.' };
  }

  private async invoke(msgs: BaseMessage[], bindTools: any[]) {
    try {
      const bound = bindTools.length > 0 ? this.model.bindTools(bindTools) : this.model;
      return await bound.invoke(msgs);
    } catch (e: any) {
      throw new ServiceUnavailableException(
        `Ollama is not reachable at ${BASE_URL} (${e.message}). Start it with "ollama serve".`,
      );
    }
  }

  private systemPrompt(user: User): string {
    return [
      `You are "DSA Buddy", a helpful assistant for the DSA Sheet app.`,
      `Today is ${new Date().toISOString().slice(0, 10)}.`,
      `The logged-in user is ${user.name} (${user.email}) with roles: ${user.roles.map((r) => r.name).join(', ') || 'none'}.`,
      `You have tools that can look up real data from the app. Use them whenever the user asks about topics, problems, resources, progress, or anything that depends on app data.`,
      `When the user asks to mark a problem as solved, use mark_problem_solved.`,
      ``,
      `Guidelines:`,
      `- Call the tools directly whenever you need data. NEVER print a tool call as JSON in your reply text — just make the call.`,
      `- Base your answers on the tool results so they reflect the actual data.`,
      `- If the tools find no match (e.g. a topic lookup returns "not found"), tell the user what you found and suggest get_topics or search_problem rather than guessing.`,
      `- When listing topics, problems, or counts, prefer the data from the tools over memory.`,
      `- Be concise and friendly.`,
    ].join('\n');
  }

  private contentToString(content: unknown): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map((c: any) => c.text ?? JSON.stringify(c)).join('');
    }
    return JSON.stringify(content);
  }

  private extractEmbeddedToolCalls(content: unknown): { name: string; args: Record<string, any> }[] {
    const text = this.contentToString(content);
    const calls: { name: string; args: Record<string, any> }[] = [];
    const regex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"parameters"\s*:\s*(\{(?:[^{}]|\{[^{}]*\})*\}\s*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      let args: Record<string, any> = {};
      try {
        args = JSON.parse(m[2]);
      } catch {
        args = {};
      }
      calls.push({ name: m[1], args });
    }
    return calls;
  }

  private async execute(executors: Record<string, ToolFn>, name: string, args: any): Promise<string> {
    const fn = executors[name];
    console.log(`[chat] tool call: ${name}`, JSON.stringify(args));
    if (!fn) return JSON.stringify({ error: `Unknown tool: ${name}` });
    try {
      return JSON.stringify(await fn(args));
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }

  private buildTools(user: User): ToolSet {
    const isAdmin = user.roles.some((r) => r.name === 'ADMIN');
    const bindTools: any[] = [];
    const executors: Record<string, ToolFn> = {};

    const register = (
      name: string,
      description: string,
      properties: Record<string, any>,
      required: string[],
      fn: ToolFn,
    ) => {
      const t = tool(fn, {
        name,
        description,
        schema: { type: 'object', properties, required },
      });
      bindTools.push(t);
      executors[name] = fn;
    };

    register('get_topics', 'List all DSA topics with their problem and resource counts.', {}, [], async () => {
      const topics = await this.topics.find({ relations: ['problems', 'resources'] });
      return topics.map((t) => ({
        id: t.id,
        name: t.name,
        problemCount: t.problems?.length ?? 0,
        resourceCount: t.resources?.length ?? 0,
      }));
    });

    register(
      'get_topic',
      'Get resources and problems for a specific topic. Provide either its id or its exact name.',
      { topicId: { type: 'number' }, name: { type: 'string' } },
      [],
      async ({ topicId, name }: { topicId?: number; name?: string }) => {
        let topic: Topic | null = null;
        if (name) {
          topic = await this.topics.findOne({ where: { name }, relations: ['problems', 'resources'] });
          if (!topic) {
            topic = await this.topics.findOne({
              where: { name: ILike(name) },
              relations: ['problems', 'resources'],
            });
          }
          if (!topic && name.length > 1 && name.toLowerCase().endsWith('s')) {
            topic = await this.topics.findOne({
              where: { name: ILike(name.slice(0, -1)) },
              relations: ['problems', 'resources'],
            });
          }
          if (!topic) {
            topic = await this.topics.findOne({
              where: { name: ILike(`${name}s`) },
              relations: ['problems', 'resources'],
            });
          }
          if (!topic) {
            const matches = await this.topics.find({
              where: { name: ILike(`%${name}%`) },
              select: ['id', 'name'],
            });
            if (matches.length === 0) {
              return { error: `Topic "${name}" not found. Use get_topics to list available topics.` };
            }
            return {
              error: `Topic "${name}" not found. Did you mean one of: ${matches.map((m) => m.name).join(', ')}?`,
              suggestions: matches.map((m) => m.name),
            };
          }
        } else if (topicId) {
          topic = await this.topics.findOne({ where: { id: topicId }, relations: ['problems', 'resources'] });
          if (!topic) return { error: `Topic ${topicId} not found. Use get_topics to list available topics.` };
        } else {
          return { error: 'Provide a topic id or name.' };
        }
        return {
          id: topic.id,
          name: topic.name,
          resources: topic.resources.map((r: Resource) => ({ id: r.id, title: r.title, url: r.url, type: r.type })),
          problems: topic.problems.map((p: Problem) => ({ id: p.id, title: p.title, url: p.url, difficulty: p.difficulty })),
        };
      },
    );

    register(
      'search_problem',
      'Search problems by title or URL keyword.',
      { query: { type: 'string' } },
      ['query'],
      async ({ query }: { query: string }) => {
        const problems = await this.problems.find({
          where: [{ title: ILike(`%${query}%`) }, { url: ILike(`%${query}%`) }],
          take: 10,
        });
        if (problems.length === 0) return { error: `No problems found matching "${query}"` };
        return problems.map((p) => ({ id: p.id, title: p.title, url: p.url, difficulty: p.difficulty }));
      },
    );

    register('get_my_progress', "Get the logged-in user's solved count and list of solved problems.", {}, [], async () => {
      const records = await this.progress.find({ where: { userId: user.id }, relations: ['problem'] });
      const total = await this.problems.count();
      return {
        solved: records.length,
        total,
        solvedProblems: records.map((r) => ({ id: r.problemId, title: r.problem?.title, url: r.problem?.url, solvedDate: r.solvedDate })),
      };
    });

    register('get_my_daily_stats', "Get the logged-in user's daily solved counts and current streak.", {}, [], async () => {
      const records = await this.progress.find({ where: { userId: user.id }, order: { solvedDate: 'DESC' } });
      const daily: Record<string, number> = {};
      for (const r of records) daily[r.solvedDate] = (daily[r.solvedDate] || 0) + 1;
      return { daily, streak: this.calcStreak(Object.keys(daily)) };
    });

    register('get_next_unsolved', 'Get the next unsolved problem for the logged-in user.', {}, [], async () => {
      const solved = await this.progress.find({ where: { userId: user.id }, select: ['problemId'] });
      const solvedIds = solved.map((s) => s.problemId);
      if (solvedIds.length === 0) {
        return this.problems.findOne({ where: {}, order: { id: 'ASC' } });
      }
      return this.problems
        .createQueryBuilder('p')
        .where('p.id NOT IN (:...solvedIds)', { solvedIds })
        .orderBy('p.id', 'ASC')
        .getOne();
    });

    register(
      'mark_problem_solved',
      'Mark a problem as solved for the logged-in user by problem id.',
      { problemId: { type: 'number' } },
      ['problemId'],
      async ({ problemId }: { problemId: number }) => {
        const problem = await this.problems.findOne({ where: { id: problemId } });
        if (!problem) return { error: `Problem ${problemId} not found` };
        const exists = await this.progress.findOne({ where: { userId: user.id, problemId } });
        if (exists) return { error: `Problem "${problem.title}" is already marked solved` };
        const today = new Date().toISOString().slice(0, 10);
        await this.progress.save(this.progress.create({ userId: user.id, problemId, solvedDate: today }));
        return { ok: true, title: problem.title };
      },
    );

    if (isAdmin) {
      register('get_users', 'List all users with their roles and disabled status. Admin only.', {}, [], async () => {
        const users = await this.users.find({ relations: ['roles'] });
        return users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          roles: u.roles.map((r) => r.name),
          disabled: u.disabled,
        }));
      });

      register(
        'get_student_progress',
        "Get a student's progress report by user id. Admin only.",
        { userId: { type: 'number' } },
        ['userId'],
        async ({ userId }: { userId: number }) => {
          const records = await this.progress.find({ where: { userId }, relations: ['problem'] });
          const total = await this.problems.count();
          return {
            userId,
            solved: records.length,
            total,
            solvedProblems: records.map((r) => ({ id: r.problemId, title: r.problem?.title, url: r.problem?.url, solvedDate: r.solvedDate })),
          };
        },
      );
    }

    return { bindTools, executors };
  }

  private calcStreak(dates: string[]): number {
    const sorted = [...dates].sort().reverse();
    if (sorted.length === 0) return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (sorted[0] !== today) return 0;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }
}
