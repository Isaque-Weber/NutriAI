import { Injectable } from '@nestjs/common';
import { AnthropometricAssessmentRepository } from '../../../domain/repositories/anthropometric-assessment.repository';
import { CreateAssessmentDto } from '../../../api/dtos/create-assessment.dto';

@Injectable()
export class CreateAssessmentUseCase {
  constructor(
    private readonly assessmentRepo: AnthropometricAssessmentRepository,
  ) {}

  execute(patientId: string, dto: CreateAssessmentDto) {
    return this.assessmentRepo.createAndSave({
      patientId,
      ...dto,
    });
  }
}
