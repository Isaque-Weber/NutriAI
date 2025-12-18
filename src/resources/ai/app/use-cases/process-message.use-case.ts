import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { MessageRole } from '../../../conversations/domain/entities/message.entity';
import { ConversationRepository } from '../../../conversations/domain/repositories/conversation.repository';
import { InferenceService } from '../../services/inference.service';
import { DynamicStructuredTool } from '@langchain/core/tools';
import axios from 'axios';
import { jsonSchemaToZod } from 'json-schema-to-zod';

export type ProcessMessageUseCaseInput = {
  userMessage: string;
  conversationId: string;
};

export type ProcessMessageUseCaseOutput = {
  answer: string;
};

@Injectable()
export class ProcessMessageUseCase extends BaseUseCase<
  ProcessMessageUseCaseInput,
  ProcessMessageUseCaseOutput
> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly inferenceService: InferenceService,
  ) {
    super();
  }

  async execute(
    input: ProcessMessageUseCaseInput,
  ): Promise<ProcessMessageUseCaseOutput> {
    const { userMessage, conversationId } = input;

    const conversation = await this.getConversation(conversationId);

    await conversation.addMessage({
      role: MessageRole.USER,
      content: userMessage,
    });

    const response = await this.inferenceService.executeInference(conversation);

    await conversation.addMessage({
      role: MessageRole.ASSISTANT,
      content: response.answer,
    });

    await this.conversationRepository.save(conversation);

    return response;
  }

  private async getConversation(conversationId: string) {
    const conversation = await this.conversationRepository.findOneById(
      conversationId,
      {
        relations: ['messages'],
      },
    );
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }
}
