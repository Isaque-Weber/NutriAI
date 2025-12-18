import { Injectable } from '@nestjs/common';
import { AnthropometricAssessmentRepository } from '../domain/repositories/anthropometric-assessment.repository';
import { CreateAssessmentDto } from '../api/dtos/create-assessment.dto';
import { AnthropometricAssessment } from '../domain/entities/anthropometric-assessment.entity';

@Injectable()
export class AnthropometricAssessmentService {
  constructor(
    private readonly assessmentRepository: AnthropometricAssessmentRepository,
  ) {}

  async create(
    dto: CreateAssessmentDto,
    patientId: string,
  ): Promise<AnthropometricAssessment> {
    const assessment = new AnthropometricAssessment();
    Object.assign(assessment, dto);
    assessment.patientId = patientId;

    return this.assessmentRepository.save(assessment);
  }

  async findAllByPatient(
    patientId: string,
  ): Promise<AnthropometricAssessment[]> {
    return this.assessmentRepository.findByPatient(patientId);
  }

  calculateBMI(weight: number, height: number): number {
    if (height <= 0) return 0;
    // Assuming height is in meters. If it's > 3, it's likely in cm, so convert.
    const heightInMeters = height > 3 ? height / 100 : height;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  }

  classifyBMI(bmi: number): string {
    if (bmi < 18.5) return 'Baixo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidade Grau I';
    if (bmi < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  }

  calculateWHR(waist: number, hip: number): number {
    if (hip <= 0) return 0;
    return parseFloat((waist / hip).toFixed(2));
  }

  classifyWHR(whr: number, gender: string): string {
    const isMale =
      gender.toLowerCase() === 'male' || gender.toLowerCase() === 'masculino';

    if (isMale) {
      if (whr <= 0.9) return 'Low risk';
      return 'High risk';
    } else {
      if (whr <= 0.85) return 'Low risk';
      return 'High risk';
    }
  }
}
