import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentDto {
  @IsNumber()
  weight!: number;

  @IsNumber()
  height!: number;

  @IsOptional()
  @IsNumber()
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  waist?: number;

  @IsOptional()
  @IsNumber()
  hip?: number;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
