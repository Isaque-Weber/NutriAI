import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../../domain/repositories/patient.repository';
import { CreatePatientDto } from '../../../api/dtos/create-patient.dto';

@Injectable()
export class CreatePatientUseCase {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(dto: CreatePatientDto, nutritionistId: string) {
    const existing = await this.patientRepo.findByEmail(dto.email);
    if (existing) throw new Error('Patient already exists');

    return await this.patientRepo.createAndSave({
      ...dto,
      nutritionistId,
    });
  }
}
