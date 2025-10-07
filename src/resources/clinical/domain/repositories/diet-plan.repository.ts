import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietPlan } from '../entities/diet-plan.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';

@Injectable()
export class DietPlanRepository extends BaseRepository<DietPlan> {
  constructor(@InjectRepository(DietPlan) repo: Repository<DietPlan>) {
    super(repo);
  }

  findByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
