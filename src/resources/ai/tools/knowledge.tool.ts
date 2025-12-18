import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { KnowledgeService } from '../services/knowledge.service';

/**
 * Cria a ferramenta de busca de conhecimento global para o agente.
 */
export function createKnowledgeTool(knowledgeService: KnowledgeService) {
  return tool(
    async ({ query }: { query: string }) => {
      try {
        const results = await knowledgeService.search(query);

        if (results.length === 0) {
          return 'Nenhuma informação específica encontrada na base de conhecimento global para esta consulta.';
        }

        const formatted = results.map((r) => r.text).join('\n---\n');

        return `[Conhecimento Recuperado]:\n\n${formatted}`;
      } catch (error) {
        return `Erro ao buscar na base de conhecimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      }
    },
    {
      name: 'search_global_knowledge',
      description:
        'Busca informações técnicas, diretrizes ou processos na base de conhecimento global da aplicação. Use quando precisar de fatos externos ou procedimentos padrão.',
      schema: z.object({
        query: z.string().describe('A consulta de busca clara e específica.'),
      }),
    },
  );
}
