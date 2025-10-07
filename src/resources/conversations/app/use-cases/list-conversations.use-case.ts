import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';

@Injectable()
export class ListConversationsUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(patientId: string) {
    return this.conversationRepo.findByPatient(patientId);
  }
}
