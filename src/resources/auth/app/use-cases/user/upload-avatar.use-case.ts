import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import GoogleCloudStorageService, {
  BucketFolder,
} from '@shared/infrastructure/storage/google-cloud-storage.service';

export interface UploadAvatarRequest {
  userId: string;
  file: Express.Multer.File;
}

export interface UploadAvatarResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl: string | null;
  updatedAt: Date;
}

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: GoogleCloudStorageService,
  ) {}

  async execute(request: UploadAvatarRequest): Promise<UploadAvatarResponse> {
    const { userId, file } = request;

    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.storageService.validateImageFile(file)) {
      throw new BadRequestException(
        'Invalid file. Only JPEG, PNG, GIF, and WebP images up to 5MB are allowed',
      );
    }

    // Find user
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Delete old avatar if exists
      if (user.avatarUrl) {
        await this.storageService.deleteFile(user.avatarUrl);
      }
      user.avatarUrl = await this.storageService.uploadFile(
        file,
        BucketFolder.AVATARS,
      );
      const updatedUser = await this.userRepository.save(user);

      return {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        avatarUrl: updatedUser.avatarUrl ?? null,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload avatar: ${error.message}`,
      );
    }
  }
}
