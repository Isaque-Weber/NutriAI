import { Injectable } from '@nestjs/common';
import { ClinicalNoteRepository } from '../../../domain/repositories/clinical-note.repository';
import { CreateClinicalNoteDto } from '../../../api/dtos/create-clinical-note.dto';

@Injectable()
export class CreateClinicalNoteUseCase {
  constructor(private readonly noteRepo: ClinicalNoteRepository) {}

  execute(patientId: string, dto: CreateClinicalNoteDto) {
    return this.noteRepo.createAndSave({
      patientId,
      ...dto,
    });
  }
}
