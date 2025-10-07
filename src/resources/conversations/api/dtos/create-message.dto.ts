import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { MessageRole } from '../../domain/entities/message.entity';

export class CreateMessageDto {
  @IsUUID()
  conversationId!: string;

  @IsEnum(MessageRole)
  role!: MessageRole;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
