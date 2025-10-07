import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(250, { message: 'First name must not exceed 250 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(250, { message: 'Last name must not exceed 250 characters' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250, { message: 'Phone number must not exceed 250 characters' })
  phoneNumber?: string;
}
