import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateConversationDto } from '../dtos/create-conversation.dto';
import { CreateConversationUseCase } from '../../app/use-cases/create-conversation.use-case';
import { ListConversationsUseCase } from '../../app/use-cases/list-conversations.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly createConversation: CreateConversationUseCase,
    private readonly listConversations: ListConversationsUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateConversationDto) {
    return this.createConversation.execute(dto);
  }

  @Get('patient/:patientId')
  listByPatient(@Param('patientId') patientId: string) {
    return this.listConversations.execute(patientId);
  }
}
