import { Injectable } from '@nestjs/common';
import { log } from '@shared/logging/logger';

export interface KnowledgeSearchResult {
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class KnowledgeService {
  /**
   * Realiza uma busca na base de conhecimento global.
   * @param query Termo de busca
   * @param limit Número máximo de resultados
   */
  async search(
    query: string,
    limit: number = 5,
  ): Promise<KnowledgeSearchResult[]> {
    log.info(`[KnowledgeService] Buscando: "${query}" (Limite: ${limit})`);

    // TODO: Integrar com banco de dados de vetores (Pinecone, Qdrant, etc.)
    // Por enquanto, retorna uma lista vazia ou mockada para o usuário testar a estrutura.

    return [];
  }
}
