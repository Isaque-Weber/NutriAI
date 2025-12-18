import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { SearchKnowledgeUseCase } from '../../assistants/app/use-cases/knowledge/search-knowledge.use-case';
import { AssistantRepository } from '../../assistants/domain/repositories/assistant.repositories';
import { KnowledgeType } from '../../assistants/domain/entities/knowledge.entity';

const zodSchema = z.object({
  query: z
    .string()
    .describe(
      'A consulta de busca para encontrar informações relevantes na base de conhecimento',
    ),
  collectionName: z
    .string()
    .optional()
    .describe(
      'Nome da base de conhecimento específica para buscar. Se não fornecido, busca em todas as 3 bases disponíveis',
    ),
});

type Input = z.infer<typeof zodSchema>;

@Injectable()
export class KnowledgeSearchTool {
  constructor(
    private readonly searchKnowledgeUseCase: SearchKnowledgeUseCase,
    private readonly assistantRepository: AssistantRepository,
  ) {}

  createKnowledgeSearchTool(assistantId: string, organizationId: string) {
    return tool(
      async (input: Input) => {
        try {
          const assistant =
            await this.assistantRepository.findOneById(assistantId);
          if (!assistant || assistant?.organizationId !== organizationId) {
            return 'Ocorreu um erro inesperado.';
          }

          const { chunksLimit: limit, scoreThreshold } =
            assistant.config.knowledges;
          const result = await this.searchKnowledgeUseCase.execute({
            query: input.query,
            assistantId,
            organizationId,
            limit,
            scoreThreshold,
            collections: input.collectionName
              ? [input.collectionName]
              : undefined,
          });

          if (result.totalResults === 0) {
            return 'Nenhuma informação relevante encontrada na base de conhecimento para esta consulta.';
          }

          const formatted = result.results
            .map((item) => {
              switch (item.type) {
                case KnowledgeType.QA_COLLECTION:
                  return `Q: ${item.question}\nA: ${item.answer}\n---`;
                case KnowledgeType.URL_COLLECTION:
                  return `${item.text}\nFonte:\n---`;
                case KnowledgeType.DOCUMENT:
                default:
                  return `${item.text}\n---`;
              }
            })
            .join('\n\n');

          return `[Conhecimentos recuperados]\n\n${formatted}`;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro desconhecido';
          return `Erro ao buscar na base de conhecimento: ${errorMessage}`;
        }
      },
      {
        name: 'search_knowledge',
        description:
          'Busca informações relevantes na base de conhecimento do assistente usando busca vetorial. Use esta ferramenta quando precisar de informações específicas que podem estar documentadas na base de conhecimento.',
        schema: zodSchema as any,
      },
    );
  }
}
