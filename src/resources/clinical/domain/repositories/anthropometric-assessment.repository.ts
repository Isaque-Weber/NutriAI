import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnthropometricAssessment } from '../entities/anthropometric-assessment.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';

@Injectable()
export class AnthropometricAssessmentRepository extends BaseRepository<AnthropometricAssessment> {
  constructor(
    @InjectRepository(AnthropometricAssessment)
    repo: Repository<AnthropometricAssessment>,
  ) {
    super(repo);
  }

  findByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
