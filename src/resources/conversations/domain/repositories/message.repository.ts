import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageRepository extends BaseRepository<Message> {
  constructor(@InjectRepository(Message) repo: Repository<Message>) {
    super(repo);
  }

  findByConversation(conversationId: string) {
    return this.repo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }
}
