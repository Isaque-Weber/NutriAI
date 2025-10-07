import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { GetUserProfileUseCase } from '../../app/use-cases/user/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../app/use-cases/user/update-user-profile.use-case';
import { UploadAvatarUseCase } from '../../app/use-cases/user/upload-avatar.use-case';
import { DeleteUserUseCase } from '../../app/use-cases/user/delete-user.use-case';
import { UpdateUserProfileDto } from '../dtos/user/update-user-profile.dto';
import { UpdateUserPreferencesDto } from '../dtos/user/update-user-preferences.dto';
import { SetPasswordDto } from '../dtos/user/set-password.dto';
import { UpdateUserPreferencesUseCase } from '../../app/use-cases/user/update-user-preferences.use-case';
import { SetPasswordUseCase } from '../../app/use-cases/user/set-password.use-case';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserPreferencesUseCase: UpdateUserPreferencesUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
  ) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = req.user?.id!;
    return this.getUserProfileUseCase.execute({
      userId,
    });
  }

  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = req.user?.id!;
    return this.updateUserProfileUseCase.execute({
      userId,
      ...updateUserProfileDto,
    });
  }

  @Put('preferences')
  async updatePreferences(
    @Req() req: Request,
    @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
  ) {
    const userId = req.user?.id!;
    return this.updateUserPreferencesUseCase.execute({
      userId,
      ...updateUserPreferencesDto,
    });
  }

  @Put('password')
  async setPassword(
    @Req() req: Request,
    @Body() setPasswordDto: SetPasswordDto,
  ) {
    const userId = req.user?.id!;
    return this.setPasswordUseCase.execute({
      userId,
      ...setPasswordDto,
    });
  }

  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user?.id!;
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadAvatarUseCase.execute({
      userId,
      file,
    });
  }

  @Delete('profile')
  async deleteAccount(@Req() req: Request) {
    const userId = req.user?.id!;
    return this.deleteUserUseCase.execute({
      userId,
    });
  }
}
