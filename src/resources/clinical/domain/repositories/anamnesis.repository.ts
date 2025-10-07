import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnesis } from '../entities/anamnesis.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';

@Injectable()
export class AnamnesisRepository extends BaseRepository<Anamnesis> {
  constructor(@InjectRepository(Anamnesis) repo: Repository<Anamnesis>) {
    super(repo);
  }

  findByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
