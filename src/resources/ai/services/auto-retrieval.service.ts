import { Injectable } from '@nestjs/common';
import { KnowledgeService, KnowledgeSearchResult } from './knowledge.service';
import { log } from '@shared/logging/logger';

@Injectable()
export class AutoRetrievalService {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  /**
   * Decide se a mensagem do usuário precisa de contexto extra e busca se necessário.
   */
  async getRelevantContext(userMessage: string): Promise<string> {
    if (!this.shouldTriggerSearch(userMessage)) {
      return '';
    }

    const results = await this.knowledgeService.search(userMessage);

    if (results.length === 0) {
      return '';
    }

    return this.formatContext(results);
  }

  private shouldTriggerSearch(message: string): boolean {
    const msg = message.toLowerCase();
    const triggerKeywords = [
      'como',
      'o que',
      'quando',
      'onde',
      'por que',
      'qual',
      'explique',
      'informação',
      'detalhes',
      'processo',
      'pesquise',
      'base de conhecimento',
    ];

    const hasMinLength = msg.trim().length > 8;
    const hasKeywords = triggerKeywords.some((k) => msg.includes(k));

    return hasMinLength && hasKeywords;
  }

  private formatContext(results: KnowledgeSearchResult[]): string {
    const contextHeader = '=== CONTEXTO DA BASE DE CONHECIMENTO GLOBAL ===\n\n';
    const formatted = results
      .map((r, i) => `[${i + 1}] (Score: ${r.score.toFixed(2)}): ${r.text}`)
      .join('\n---\n');

    return `${contextHeader}${formatted}\n\n=== FIM DO CONTEXTO ===`;
  }
}
