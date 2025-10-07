import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDietPlanDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsNumber()
  totalCalories?: number;

  @IsString()
  content!: string;
}
