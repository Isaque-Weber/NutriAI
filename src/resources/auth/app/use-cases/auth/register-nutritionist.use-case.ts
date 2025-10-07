import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../../../@shared/enums/user-role.enum';

@Injectable()
export class RegisterNutritionistUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new BadRequestException('Email já cadastrado.');

    const password = await bcrypt.hash(input.password, 10);

    const user = await this.userRepo.createUser({
      ...input,
      password,
      role: UserRole.NUTRITIONIST,
    });

    return user;
  }
}
