import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorators';
import { UserRole } from '@shared/enums/user-role.enum';
import { GenerateReplyUseCase } from '../../app/use-cases/generate-reply.use-case';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly generateReply: GenerateReplyUseCase) {}

  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @Post('conversations/:conversationId/reply')
  generate(
    @Param('conversationId') conversationId: string,
    @Body('prompt') prompt: string,
  ) {
    return this.generateReply.execute(conversationId, prompt);
  }
}
