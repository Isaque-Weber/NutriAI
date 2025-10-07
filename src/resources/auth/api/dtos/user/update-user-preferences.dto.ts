import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CommunicationPreferencesDto {
  @IsOptional()
  @IsBoolean({ message: 'Email preference must be a boolean value' })
  email?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'WhatsApp preference must be a boolean value' })
  whatsapp?: boolean;
}

export class UpdateUserPreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CommunicationPreferencesDto)
  communication?: CommunicationPreferencesDto;
}
