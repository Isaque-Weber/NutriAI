import { Injectable } from '@nestjs/common';
import { DietPlanRepository } from '../../../domain/repositories/diet-plan.repository';
import { CreateDietPlanDto } from '../../../api/dtos/create-diet-plan.dto';

@Injectable()
export class CreateDietPlanUseCase {
  constructor(private readonly dietRepo: DietPlanRepository) {}

  execute(patientId: string, dto: CreateDietPlanDto) {
    return this.dietRepo.createAndSave({
      patientId,
      ...dto,
    });
  }
}
