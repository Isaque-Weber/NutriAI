import { Injectable } from '@nestjs/common';
import { AnamnesisRepository } from '../../../domain/repositories/anamnesis.repository';
import { CreateAnamnesisDto } from '../../../api/dtos/create-anamnesis.dto';

@Injectable()
export class CreateAnamnesisUseCase {
  constructor(private readonly anamnesisRepo: AnamnesisRepository) {}

  async execute(patientId: string, dto: CreateAnamnesisDto) {
    return this.anamnesisRepo.createAndSave({
      patientId,
      ...dto,
    });
  }
}
