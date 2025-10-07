import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../../domain/repositories/patient.repository';

@Injectable()
export class GetPatientByIdUseCase {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(id: string, nutritionistId: string) {
    const patient = await this.patientRepo.findOneById(id);
    if (!patient || patient.nutritionistId !== nutritionistId) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }
}
