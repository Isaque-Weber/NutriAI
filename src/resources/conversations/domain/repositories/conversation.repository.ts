import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
  constructor(@InjectRepository(Conversation) repo: Repository<Conversation>) {
    super(repo);
  }

  async findLatestByPatient(patientId: string): Promise<Conversation | null> {
    return this.repo.findOne({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  findByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });
  }
}
