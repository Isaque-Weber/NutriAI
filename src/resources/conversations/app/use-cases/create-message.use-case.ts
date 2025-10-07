import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { CreateMessageDto } from '../../api/dtos/create-message.dto';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly conversationRepo: ConversationRepository,
  ) {}

  async execute(dto: CreateMessageDto) {
    const conversation = await this.conversationRepo.findOneById(
      dto.conversationId,
    );
    if (!conversation) throw new Error('Conversation not found');

    const message = await this.messageRepo.createAndSave({
      ...dto,
    });

    conversation.lastMessageDate = new Date();
    await this.conversationRepo.save(conversation);

    return message;
  }
}
