import { Injectable } from '@nestjs/common';
import { log } from '@shared/logging/logger';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { env } from '@config/envs/env.validation';
import * as crypto from 'crypto';

export interface KnowledgeSearchResult {
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class KnowledgeService {
  private client: QdrantClient;
  private readonly COLLECTION_NAME = 'nutriai_knowledge';

  constructor() {
    this.client = new QdrantClient({
      host: env.QDRANT_HOST,
      port: env.QDRANT_PORT,
      apiKey: env.QDRANT_API_KEY,
    });
    this.initCollection();
  }

  private async initCollection() {
    try {
      const result = await this.client.getCollections();
      const exists = result.collections.some(
        (c) => c.name === this.COLLECTION_NAME,
      );

      if (!exists) {
        await this.client.createCollection(this.COLLECTION_NAME, {
          vectors: {
            size: 1536, // OpenAI embedding size
            distance: 'Cosine',
          },
        });
        log.info(`[KnowledgeService] Coleção '${this.COLLECTION_NAME}' criada.`);
      }
    } catch (error) {
      log.error('[KnowledgeService] Erro ao inicializar Qdrant:', error);
    }
  }

  /**
   * Realiza uma busca na base de conhecimento global.
   * @param query Termo de busca (neste caso, idealmente seria o vetor)
   * @param limit Número máximo de resultados
   */
  async search(
    query: string,
    limit: number = 5,
  ): Promise<KnowledgeSearchResult[]> {
    try {
      const embedding = await this.generateEmbedding(query);

      const searchResult = await this.client.search(this.COLLECTION_NAME, {
        vector: embedding,
        limit,
      });

      return searchResult.map((hit) => ({
        text: hit.payload?.text as string,
        score: hit.score,
        metadata: (hit.payload as Record<string, any>) ?? undefined,
      }));
    } catch (error) {
      log.error('[KnowledgeService] Erro na busca:', error);
      return [];
    }
  }

  async indexText(text: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(text);
      
      await this.client.upsert(this.COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: crypto.randomUUID(),
            vector: embedding,
            payload: {
              text,
              ...metadata,
            },
          },
        ],
      });
      log.info(`[KnowledgeService] Texto indexado com sucesso.`);
    } catch (error) {
      log.error('[KnowledgeService] Erro ao indexar texto:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = new OpenAIEmbeddings({
      apiKey: env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      modelName: 'text-embedding-3-small',
    });
    
    return await embeddings.embedQuery(text);
  }
}
