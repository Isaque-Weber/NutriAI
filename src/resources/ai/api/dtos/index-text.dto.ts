import { IsOptional, IsString, IsObject } from 'class-validator';

export class IndexTextDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
