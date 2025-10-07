import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserPreferences } from '../../../domain/entities/user.entity';

export interface UpdateUserPreferencesRequest {
  userId: string;
  communication?: {
    email?: boolean;
    whatsapp?: boolean;
  };
}

export interface UpdateUserPreferencesResponse {
  id: string;
  preferences: UserPreferences;
  updatedAt: Date;
}

@Injectable()
export class UpdateUserPreferencesUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: UpdateUserPreferencesRequest,
  ): Promise<UpdateUserPreferencesResponse> {
    const user = await this.userRepository.findOneById(request.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merge the preferences with existing ones
    if (request.communication) {
      user.preferences = {
        ...user.preferences,
        communication: {
          ...user.preferences.communication,
          ...request.communication,
        },
      };
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      preferences: updatedUser.preferences,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
