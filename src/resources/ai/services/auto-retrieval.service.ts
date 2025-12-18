import { Injectable } from '@nestjs/common';
import { SearchKnowledgeUseCase } from '../../assistants/app/use-cases/knowledge/search-knowledge.use-case';
import { log } from '@shared/logging/logger';
import { AssistantConfig } from '../../assistants/domain/entities/assistant.entity';

export interface AutoRetrievalRequest {
  userMessage: string;
  assistantId: string;
  organizationId: string;
  assistantConfig: AssistantConfig;
}

export interface AutoRetrievalResponse {
  retrievedContext: string;
  hasRelevantContext: boolean;
  resultsCount: number;
}

@Injectable()
export class AutoRetrievalService {
  constructor(
    private readonly searchKnowledgeUseCase: SearchKnowledgeUseCase,
  ) {}

  async executeAutoRetrieval(
    request: AutoRetrievalRequest,
  ): Promise<AutoRetrievalResponse> {
    try {
      log.info(
        `Executando auto-retrieval para mensagem: "${request.userMessage}"`,
      );

      if (!request.assistantConfig?.knowledges?.autoRetrieval) {
        log.info('Auto-retrieval não está habilitado para este assistente');
        return {
          retrievedContext: '',
          hasRelevantContext: false,
          resultsCount: 0,
        };
      }

      const knowledgeConfig = request.assistantConfig.knowledges;
      const searchResult = await this.searchKnowledgeUseCase.execute({
        query: request.userMessage,
        assistantId: request.assistantId,
        organizationId: request.organizationId,
        limit: knowledgeConfig.chunksLimit,
        scoreThreshold: knowledgeConfig.scoreThreshold,
      });

      if (searchResult.totalResults === 0) {
        log.info('Nenhum contexto relevante encontrado para auto-retrieval');
        return {
          retrievedContext: '',
          hasRelevantContext: false,
          resultsCount: 0,
        };
      }

      const retrievedContext = this.formatRetrievedContext(
        searchResult.results,
      );
      log.info(
        `Auto-retrieval encontrou ${searchResult.results.length} resultados relevantes`,
      );

      return {
        retrievedContext,
        hasRelevantContext: true,
        resultsCount: searchResult.results.length,
      };
    } catch (error) {
      log.error('Erro no auto-retrieval:', error);
      return {
        retrievedContext: '',
        hasRelevantContext: false,
        resultsCount: 0,
      };
    }
  }

  private formatRetrievedContext(
    results: Array<{
      text: string;
      score: number;
      knowledgeId: string;
      chunkIndex: number;
      totalChunks: number;
    }>,
  ): string {
    const contextHeader =
      '=== CONTEXTO RELEVANTE DA BASE DE CONHECIMENTO ===\n\n';

    const formattedResults = results
      .map((result, index) => {
        const chunkInfo =
          result.totalChunks > 1
            ? `\n**Chunk:** ${result.chunkIndex + 1}/${result.totalChunks}`
            : '';

        return `**${index + 1}. [Relevância: ${(result.score * 100).toFixed(1)}%]**${chunkInfo}\n${result.text}\n`;
      })
      .join('\n---\n\n');

    const contextFooter = '\n=== FIM DO CONTEXTO ===\n\n';

    return contextHeader + formattedResults + contextFooter;
  }

  shouldTriggerAutoRetrieval(userMessage: string): boolean {
    const message = userMessage.toLowerCase();

    const triggerKeywords = [
      'como',
      'o que',
      'quando',
      'onde',
      'por que',
      'qual',
      'quais',
      'explique',
      'me ajude',
      'preciso',
      'gostaria',
      'pode me dizer',
      'informação',
      'detalhes',
      'processo',
      'procedimento',
      'passo',
      'documentação',
      'manual',
      'guia',
      'tutorial',
      'exemplo',
      'política',
      'regra',
      'norma',
      'padrão',
      'requisito',
      'erro',
      'problema',
      'solução',
      'resolução',
      'troubleshooting',
    ];

    const hasTriggerKeywords = triggerKeywords.some((keyword) =>
      message.includes(keyword),
    );

    const hasMinimumLength = message.trim().length > 10;

    const isNotGeneric = ![
      'oi',
      'olá',
      'bom dia',
      'boa tarde',
      'boa noite',
      'tchau',
      'obrigado',
    ].includes(message.trim());

    return hasTriggerKeywords && hasMinimumLength && isNotGeneric;
  }
}
