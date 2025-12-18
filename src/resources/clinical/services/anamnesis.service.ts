import { Injectable, NotFoundException } from '@nestjs/common';
import { AnamnesisRepository } from '../domain/repositories/anamnesis.repository';
import { CreateAnamnesisDto } from '../api/dtos/create-anamnesis.dto';
import { Anamnesis } from '../domain/entities/anamnesis.entity';

@Injectable()
export class AnamnesisService {
  constructor(private readonly anamnesisRepository: AnamnesisRepository) {}

  async create(dto: CreateAnamnesisDto, patientId: string): Promise<Anamnesis> {
    const anamnesis = new Anamnesis();
    Object.assign(anamnesis, dto);
    anamnesis.patientId = patientId;

    return this.anamnesisRepository.save(anamnesis);
  }

  async update(
    id: string,
    dto: Partial<CreateAnamnesisDto>,
  ): Promise<Anamnesis> {
    const anamnesis = await this.findOne(id);
    Object.assign(anamnesis, dto);
    return this.anamnesisRepository.save(anamnesis);
  }

  async findOne(id: string): Promise<Anamnesis> {
    const anamnesis = await this.anamnesisRepository.findOneById(id);
    if (!anamnesis) {
      throw new NotFoundException('Anamnesis not found.');
    }
    return anamnesis;
  }

  async findAllByPatient(patientId: string): Promise<Anamnesis[]> {
    return this.anamnesisRepository.findByPatient(patientId);
  }
}
