import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { CreateMessageUseCase } from '../../app/use-cases/create-message.use-case';
import { ListMessagesUseCase } from '../../app/use-cases/list-messages.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
@Controller('conversations/:conversationId/messages')
export class MessageController {
  constructor(
    private readonly createMessage: CreateMessageUseCase,
    private readonly listMessages: ListMessagesUseCase,
  ) {}

  @Post()
  create(
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.createMessage.execute({ ...dto, conversationId });
  }

  @Get()
  list(@Param('conversationId') conversationId: string) {
    return this.listMessages.execute(conversationId);
  }
}
