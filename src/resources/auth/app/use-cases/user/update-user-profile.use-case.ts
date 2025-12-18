import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

export interface UpdateUserProfileRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UpdateUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  private isValidPhoneNumber(phoneNumber: string | undefined | null): boolean {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  async execute(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    const user = await this.userRepository.findOneById(request.userId, {
      relations: ['accounts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (request.firstName !== undefined) {
      user.firstName = request.firstName;
    }

    if (request.lastName !== undefined) {
      user.lastName = request.lastName;
    }

    if (request.phoneNumber !== undefined) {
      user.phoneNumber = request.phoneNumber;
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      avatarUrl: user.avatarUrl ?? user.accounts[0]?.providerAvatarUrl,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
