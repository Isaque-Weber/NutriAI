import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalNote } from '../entities/clinical-note.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';

@Injectable()
export class ClinicalNoteRepository extends BaseRepository<ClinicalNote> {
  constructor(@InjectRepository(ClinicalNote) repo: Repository<ClinicalNote>) {
    super(repo);
  }

  findByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
