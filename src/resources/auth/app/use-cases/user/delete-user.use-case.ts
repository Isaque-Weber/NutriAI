import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { GoogleCloudStorageService } from '../../../../../@shared/infrastructure/storage/google-cloud-storage.service';

export interface DeleteUserRequest {
  userId: string;
}

export interface DeleteUserResponse {
  message: string;
  deletedAt: Date;
}

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: GoogleCloudStorageService,
  ) {}

  async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    const { userId } = request;

    // Find user
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Delete user's avatar from storage if exists
      if (user.avatarUrl) {
        await this.storageService.deleteFile(user.avatarUrl);
      }

      // Delete user from database
      await this.userRepository.delete(userId);

      return {
        message: 'User deleted successfully',
        deletedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
