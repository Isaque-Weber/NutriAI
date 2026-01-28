import { Injectable, HttpException } from '@nestjs/common';
import { AiProvider } from '../../domain/interfaces/ai-provider.interface';
import axios from 'axios';

import { env } from '@config/envs/env.validation';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  name = 'openrouter';

  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly API_KEY = env.OPENROUTER_API_KEY;

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.API_URL,
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const message = response.data.choices?.[0]?.message?.content;
      return message ?? 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('[OpenRouter] Error:', error);
      throw new HttpException('Erro ao gerar resposta com OpenRouter', 500);
    }
  }
}
