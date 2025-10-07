import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { CreateConversationDto } from '../../api/dtos/create-conversation.dto';

@Injectable()
export class CreateConversationUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(dto: CreateConversationDto) {
    const existing = await this.conversationRepo.findLatestByPatient(
      dto.patientId,
    );

    // Caso queira impedir múltiplas conversas ativas:
    if (existing) return existing;

    return this.conversationRepo.createAndSave({
      patientId: dto.patientId,
      lastMessageDate: dto.lastMessageDate ?? new Date(),
    });
  }
}
