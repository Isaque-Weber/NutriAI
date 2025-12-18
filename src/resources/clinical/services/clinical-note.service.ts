import { Injectable } from '@nestjs/common';
import { ClinicalNoteRepository } from '../domain/repositories/clinical-note.repository';
import { CreateClinicalNoteDto } from '../api/dtos/create-clinical-note.dto';
import { ClinicalNote } from '../domain/entities/clinical-note.entity';

@Injectable()
export class ClinicalNoteService {
  constructor(
    private readonly clinicalNoteRepository: ClinicalNoteRepository,
  ) {}

  async create(
    dto: CreateClinicalNoteDto,
    patientId: string,
  ): Promise<ClinicalNote> {
    const note = new ClinicalNote();
    Object.assign(note, dto);
    note.patientId = patientId;

    return this.clinicalNoteRepository.save(note);
  }

  async findByPatient(patientId: string): Promise<ClinicalNote[]> {
    return this.clinicalNoteRepository.findByPatient(patientId);
  }
}
