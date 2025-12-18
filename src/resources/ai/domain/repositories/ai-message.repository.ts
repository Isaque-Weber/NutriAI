import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiMessage } from '../entities/ai-message.entity';
import { BaseRepository } from '@shared/abstractions/typeorm/base.repository';

@Injectable()
export class AiMessageRepository extends BaseRepository<AiMessage> {
  constructor(@InjectRepository(AiMessage) repo: Repository<AiMessage>) {
    super(repo);
  }

  findByConversation(conversationId: string) {
    return this.repo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }
}
