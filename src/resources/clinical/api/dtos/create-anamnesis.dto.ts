import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnamnesisDto {
  @IsString()
  @IsNotEmpty()
  objectives!: string;

  @IsOptional()
  @IsString()
  healthHistory?: string;

  @IsOptional()
  @IsString()
  foodPreferences?: string;

  @IsOptional()
  @IsString()
  lifestyle?: string;
}
