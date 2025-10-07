import { IsUUID, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  lastMessageDate?: Date;
}
