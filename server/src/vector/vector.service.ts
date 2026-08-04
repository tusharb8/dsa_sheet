import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OllamaEmbeddings } from '@langchain/ollama';
import { Topic } from '../topic/entities/topic.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Problem } from '../problem/entities/problem.entity';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const COLLECTION = process.env.QDRANT_COLLECTION || 'dsa_sheet';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM) || 768;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface IndexedDoc {
  id: string;
  type: 'problem' | 'resource';
  title: string;
  url: string;
  topicName: string;
  difficulty?: string;
  text: string;
}

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly logger = new Logger(VectorService.name);
  private client?: QdrantClient;
  private readonly embeddings = new OllamaEmbeddings({
    baseUrl: OLLAMA_URL,
    model: EMBEDDING_MODEL,
  });

  constructor(
    @InjectRepository(Topic) private readonly topics: Repository<Topic>,
    @InjectRepository(Resource) private readonly resources: Repository<Resource>,
    @InjectRepository(Problem) private readonly problems: Repository<Problem>,
  ) {}

  async onModuleInit() {
    await this.ensureCollection().catch((e) =>
      this.logger.warn(`Qdrant not ready (${e.message}). Semantic search will be disabled.`),
    );
  }

  get enabled() {
    return !!QDRANT_API_KEY || QDRANT_URL.startsWith('http://localhost');
  }

  private getClient(): QdrantClient {
    if (!this.client) {
      this.client = new QdrantClient({
        url: QDRANT_URL,
        ...(QDRANT_API_KEY ? { apiKey: QDRANT_API_KEY } : {}),
      });
    }
    return this.client;
  }

  async ensureCollection() {
    const client = this.getClient();
    const exists = await client.collectionExists(COLLECTION);
    if (!exists.exists) {
      await client.createCollection(COLLECTION, {
        vectors: { size: EMBEDDING_DIM, distance: 'Cosine' },
      });
      this.logger.log(`Created Qdrant collection "${COLLECTION}" (${EMBEDDING_DIM}d)`);
    }
  }

  async status() {
    try {
      const client = this.getClient();
      const [info, collection] = await Promise.all([
        client.collectionClusterInfo(COLLECTION).catch(() => null),
        client.getCollection(COLLECTION).catch(() => null),
      ]);
      const points = collection ? (await client.count(COLLECTION, { exact: true })).count : 0;
      return {
        ok: true,
        url: QDRANT_URL,
        host: new URL(QDRANT_URL).host,
        collection: COLLECTION,
        exists: !!collection,
        shards: info?.shard_count ?? null,
        points,
        embeddingModel: EMBEDDING_MODEL,
        dim: EMBEDDING_DIM,
      };
    } catch (e: any) {
      return { ok: false, url: QDRANT_URL, collection: COLLECTION, error: e.message };
    }
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embeddings.embedDocuments([text]);
    return vector;
  }

  async loadDocs(): Promise<IndexedDoc[]> {
    const topics = await this.topics.find({ relations: ['problems', 'resources'] });
    const docs: IndexedDoc[] = [];
    for (const t of topics) {
      for (const p of t.problems ?? []) {
        docs.push({
          id: `problem-${p.id}`,
          type: 'problem',
          title: p.title,
          url: p.url,
          topicName: t.name,
          difficulty: p.difficulty,
          text: `${p.title} (${t.name}) difficulty ${p.difficulty}`,
        });
      }
      for (const r of t.resources ?? []) {
        docs.push({
          id: `resource-${r.id}`,
          type: 'resource',
          title: r.title,
          url: r.url,
          topicName: t.name,
          text: `${r.title} (${t.name}) ${r.type}`,
        });
      }
    }
    return docs;
  }

  async upsertDocs(docs: IndexedDoc[]) {
    if (docs.length === 0) return;
    const client = this.getClient();
    const vectors = await this.embeddings.embedDocuments(docs.map((d) => d.text));
    const points = docs.map((d, i) => ({
      id: this.pointId(d.type, Number(d.id.split('-')[1])),
      vector: vectors[i],
      payload: {
        type: d.type,
        id: Number(d.id.split('-')[1]),
        title: d.title,
        url: d.url,
        topic: d.topicName,
        difficulty: d.difficulty ?? null,
        text: d.text,
      },
    }));
    await client.upsert(COLLECTION, { points });
    this.logger.log(`Upserted ${points.length} points into "${COLLECTION}"`);
  }

  private pointId(type: 'problem' | 'resource', id: number): number {
    return type === 'problem' ? id : 1_000_000_000 + id;
  }

  async reindexAll(): Promise<{ ok: boolean; indexed: number; removed: number }> {
    await this.ensureCollection();
    const docs = await this.loadDocs();
    await this.upsertDocs(docs);

    const client = this.getClient();
    const all = await client.scroll(COLLECTION, { limit: 10_000, with_payload: false });
    const known = new Set(docs.map((d) => this.pointId(d.type, Number(d.id.split('-')[1]))));
    const stale = (all.points ?? []).filter((p) => !known.has(Number(p.id))).map((p) => p.id);
    if (stale.length) {
      await client.delete(COLLECTION, { points: stale });
    }
    return { ok: true, indexed: docs.length, removed: stale.length };
  }

  async search(
    query: string,
    limit = 8,
    type?: 'problem' | 'resource',
  ): Promise<Array<Record<string, any>>> {
    await this.ensureCollection();
    const vector = await this.embed(query);
    const client = this.getClient();
    const res = await client.query(COLLECTION, {
      query: vector,
      limit,
      with_payload: true,
      filter: type ? { must: [{ key: 'type', match: { value: type } }] } : undefined,
    });
    return (res.points ?? []).map((p: any) => ({
      id: p.payload?.id ?? p.id,
      pointId: p.id,
      score: p.score,
      ...(p.payload ?? {}),
    }));
  }

  async removeByType(type: 'problem' | 'resource', id: number) {
    try {
      const client = this.getClient();
      await client.delete(COLLECTION, { points: [this.pointId(type, id)] });
    } catch {
      // ignore when collection does not exist yet
    }
  }
}
