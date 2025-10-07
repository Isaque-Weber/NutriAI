import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { CreateAssessmentUseCase } from '../../app/use-cases/assessment/create-assessment.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('patients/:patientId/assessments')
export class AnthropometricController {
  constructor(private readonly createAssessment: CreateAssessmentUseCase) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.createAssessment.execute(patientId, dto);
  }
}
