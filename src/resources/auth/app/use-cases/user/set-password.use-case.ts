import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseUseCase } from '../../../../../@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';

export type SetPasswordUseCaseInput = {
  userId: string;
  currentPassword?: string;
  newPassword: string;
};

export type SetPasswordUseCaseOutput = {
  success: boolean;
};

@Injectable()
export class SetPasswordUseCase extends BaseUseCase<
  SetPasswordUseCaseInput,
  SetPasswordUseCaseOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(
    input: SetPasswordUseCaseInput,
  ): Promise<SetPasswordUseCaseOutput> {
    const { userId, currentPassword, newPassword } = input;

    // Find user
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has existing password
    const hasExistingPassword = !!user.password;

    if (hasExistingPassword) {
      // User has password - currentPassword is required
      if (!currentPassword) {
        throw new BadRequestException(
          'Current password is required to change your password',
        );
      }

      // Validate current password
      const isCurrentPasswordValid = await user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    } else {
      // User doesn't have password (OAuth user) - currentPassword should be ignored if provided
      if (currentPassword) {
        // Optional: warn that currentPassword is not needed, but don't fail
        // We'll just ignore it silently for better UX
      }
    }

    // Set new password
    await user.setPassword(newPassword);
    await this.userRepository.save(user);

    return {
      success: true,
    };
  }
}
