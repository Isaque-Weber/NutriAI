import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PatientRepository } from '../domain/repositories/patient.repository';
import { CreatePatientDto } from '../api/dtos/create-patient.dto';
import { Patient } from '../domain/entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(
    dto: CreatePatientDto,
    nutritionistId: string,
  ): Promise<Patient> {
    const existingPatient = await this.patientRepository.findByEmail(dto.email);
    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists.');
    }

    const patient = new Patient();
    Object.assign(patient, dto);
    patient.nutritionistId = nutritionistId;

    return this.patientRepository.save(patient);
  }

  async findAll(nutritionistId: string): Promise<Patient[]> {
    return this.patientRepository.findByNutritionist(nutritionistId);
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOneById(id);
    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }
    return patient;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
