import { Injectable } from '@nestjs/common';
import { AnthropometricAssessmentService } from '../../../services/anthropometric-assessment.service';
import { CreateAssessmentDto } from '../../../api/dtos/create-assessment.dto';

@Injectable()
export class CreateAssessmentUseCase {
  constructor(
    private readonly assessmentService: AnthropometricAssessmentService,
  ) {}

  execute(patientId: string, dto: CreateAssessmentDto) {
    return this.assessmentService.create(dto, patientId);
  }
}
