import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class ListMessagesUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  execute(conversationId: string) {
    return this.messageRepo.findByConversation(conversationId);
  }
}
