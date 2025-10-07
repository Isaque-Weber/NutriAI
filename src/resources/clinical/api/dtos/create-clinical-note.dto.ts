import { IsString } from 'class-validator';

export class CreateClinicalNoteDto {
  @IsString()
  content!: string;
}
