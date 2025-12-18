import { Injectable } from '@nestjs/common';
import { AiMessageRepository } from '../../domain/repositories/ai-message.repository';
import { OpenRouterProvider } from '@resources/ai/infrastructure/providers/openrouter.provider';

@Injectable()
export class GenerateReplyUseCase {
  constructor(
    private readonly aiRepo: AiMessageRepository,
    private readonly provider: OpenRouterProvider,
  ) {}

  async execute(conversationId: string, prompt: string) {
    // 1️⃣ Gera a resposta via OpenRouter
    const response = await this.provider.generateResponse(prompt);

    // 2️⃣ Armazena o histórico no banco
    const message = await this.aiRepo.createAndSave({
      conversationId,
      prompt,
      response,
      provider: this.provider.name,
    });

    // 3️⃣ Retorna o resultado
    return {
      provider: this.provider.name,
      model: 'gpt-4o-mini',
      message: response,
      saved: message,
    };
  }
}
