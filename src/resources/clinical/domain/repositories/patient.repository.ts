import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';

@Injectable()
export class PatientRepository extends BaseRepository<Patient> {
  constructor(@InjectRepository(Patient) repo: Repository<Patient>) {
    super(repo);
  }

  findByEmail(email: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { email } });
  }

  findByNutritionist(nutritionistId: string): Promise<Patient[]> {
    return this.repo.find({ where: { nutritionistId } });
  }
}
