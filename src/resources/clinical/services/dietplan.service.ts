import { Injectable } from '@nestjs/common';
import { DietPlanRepository } from '../domain/repositories/diet-plan.repository';
import { CreateDietPlanDto } from '../api/dtos/create-diet-plan.dto';
import { DietPlan } from '../domain/entities/diet-plan.entity';
import { Patient } from '../domain/entities/patient.entity';
import { AnthropometricAssessment } from '../domain/entities/anthropometric-assessment.entity';

@Injectable()
export class DietPlanService {
  constructor(private readonly dietPlanRepository: DietPlanRepository) {}

  async create(dto: CreateDietPlanDto, patientId: string): Promise<DietPlan> {
    const dietPlan = new DietPlan();
    Object.assign(dietPlan, dto);
    dietPlan.patientId = patientId;

    return this.dietPlanRepository.save(dietPlan);
  }

  async findByPatient(patientId: string): Promise<DietPlan[]> {
    return this.dietPlanRepository.findByPatient(patientId);
  }

  calculateTDEE(
    patient: Patient,
    assessment: AnthropometricAssessment,
    activityFactor: number = 1.2,
  ): number {
    if (!patient.birthDate || !patient.gender) {
      throw new Error(
        'Patient birthDate and gender are required for TDEE calculation',
      );
    }

    const age = this.calculateAge(patient.birthDate);
    const weight = assessment.weight;
    // Height in assessment is usually in meters (based on my previous assumption), but Mifflin-St Jeor uses cm.
    // If height is small (< 3), assume meters and convert to cm.
    const heightCm =
      assessment.height < 3 ? assessment.height * 100 : assessment.height;

    let bmr = 10 * weight + 6.25 * heightCm - 5 * age;

    const isMale =
      patient.gender.toLowerCase() === 'male' ||
      patient.gender.toLowerCase() === 'masculino';

    if (isMale) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    return Math.round(bmr * activityFactor);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    // Ensure birthDate is a Date object
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
