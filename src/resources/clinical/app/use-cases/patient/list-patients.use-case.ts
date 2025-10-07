import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../../domain/repositories/patient.repository';

@Injectable()
export class ListPatientsUseCase {
  constructor(private readonly patientRepo: PatientRepository) {}

  execute(nutritionistId: string) {
    return this.patientRepo.findByNutritionist(nutritionistId);
  }
}
