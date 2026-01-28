import { Injectable } from '@nestjs/common';
import { AiMessageRepository } from '../../domain/repositories/ai-message.repository';
import { OpenRouterProvider } from '@resources/ai/infrastructure/providers/openrouter.provider';
import { KnowledgeService } from '@resources/ai/services/knowledge.service';

@Injectable()
export class GenerateReplyUseCase {
  constructor(
    private readonly aiRepo: AiMessageRepository,
    private readonly provider: OpenRouterProvider,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async execute(conversationId: string, prompt: string) {
    // 1️⃣ Busca contexto relevante (RAG)
    const contextResults = await this.knowledgeService.search(prompt, 3);
    const contextText = contextResults
      .map((k) => `- ${k.text} (Fonte: ${k.metadata?.source || 'Desconhecida'})`)
      .join('\n');

    // 2️⃣ Monta o prompt com contexto
    let finalPrompt = prompt;
    if (contextText) {
      finalPrompt = `
        Use as seguintes informações de contexto para responder à pergunta do usuário. Se a resposta não estiver no contexto, use seu conhecimento base, mas priorize o contexto fornecido.

        CONTEXTO:
        ${contextText}

        PERGUNTA:
        ${prompt}
      `.trim();
    }

    // 3️⃣ Gera a resposta via OpenRouter
    const response = await this.provider.generateResponse(finalPrompt);

    // 4️⃣ Armazena o histórico no banco
    const message = await this.aiRepo.createAndSave({
      conversationId,
      prompt, // Salva o prompt original do usuário
      response,
      provider: this.provider.name,
    });

    // 5️⃣ Retorna o resultado
    return {
      provider: this.provider.name,
      model: 'gpt-4o-mini',
      message: response,
      saved: message,
      contextUsed: contextResults.length > 0,
    };
  }
}
