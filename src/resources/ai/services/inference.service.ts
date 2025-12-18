import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Conversation } from '../../conversations/domain/entities/conversation.entity';
import {
  Message,
  MessageRole,
} from '../../conversations/domain/entities/message.entity';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { engine } from './factories/engine.factory';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InferenceService {
  private readonly DEFAULT_SYSTEM_PROMPT = `Você é o NutriAI, um assistente virtual especializado em nutrição.
Seu objetivo é ajudar nutricionistas e pacientes com dúvidas sobre alimentação, saúde e bem-estar.
Seja sempre cordial, profissional e baseie suas respostas em evidências científicas quando possível.
Se não souber a resposta, admita e sugira que o usuário procure um profissional.`;

  constructor(private readonly configService: ConfigService) {}

  async executeInference(conversation: Conversation) {
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage?.role !== 'user')
      throw new InternalServerErrorException(
        `[${InferenceService.name}] A última mensagem da conversa não é de usuário.`,
      );

    const messages = this.convertToLangChainMessages(conversation.messages);

    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY')!;

    // Initialize the engine with default model
    const llm = engine(apiKey);

    // Create the agent (currently without tools, but ready for them)
    const agent = createReactAgent({
      llm,
      tools: [], // Add tools here if needed in the future
    });

    const context = {
      user: {
        name: conversation.patient?.name ?? 'Não identificado',
      },
      date: {
        dateCurrent: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'America/Sao_Paulo',
        }),
        timeCurrent: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Sao_Paulo',
        }),
      },
    };

    const systemPrompt = `${this.DEFAULT_SYSTEM_PROMPT}
    
Contexto do Usuário:
Nome: ${context.user.name}
Data Atual: ${context.date.dateCurrent} ${context.date.timeCurrent}`;

    const result = await agent.invoke({
      messages: [new SystemMessage(systemPrompt), ...messages],
    });

    return {
      answer: result.messages[result.messages.length - 1]?.content as string,
    };
  }

  private convertToLangChainMessages(messages: Message[]): BaseMessage[] {
    const langChainMessages: BaseMessage[] = [];
    // Take last 20 messages to avoid hitting token limits
    const lastMessages = messages.slice(-20);

    for (const message of lastMessages) {
      const content = message.content || '';
      switch (message.role) {
        case MessageRole.USER:
          langChainMessages.push(new HumanMessage(content));
          break;
        case MessageRole.ASSISTANT:
          langChainMessages.push(new AIMessage(content));
          break;
        // Tool messages can be added here when tools are implemented
      }
    }

    return langChainMessages;
  }
}
