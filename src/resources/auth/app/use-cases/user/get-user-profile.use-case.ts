import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User, UserPreferences } from '../../../domain/entities/user.entity';

export interface GetUserProfileRequest {
  userId: string;
}

export interface GetUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  hasPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: GetUserProfileRequest,
  ): Promise<GetUserProfileResponse> {
    const user = await this.userRepository.findOneById(request.userId, {
      relations: ['accounts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl ?? user.accounts[0]?.providerAvatarUrl,
      preferences: user.preferences,
      hasPassword: !!user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
