import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../../../@shared/enums/user-role.enum';

@Injectable()
export class CreatePatientUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    nutritionistId: string;
  }) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new Error('Email já cadastrado.');

    const user = await this.userRepo.createAndSave({
      ...input,
      role: UserRole.PATIENT,
      nutritionistId: input.nutritionistId,
    });

    return user;
  }
}
