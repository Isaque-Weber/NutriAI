import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateDietPlanDto } from '../dtos/create-diet-plan.dto';
import { CreateDietPlanUseCase } from '../../app/use-cases/diet-plan/create-diet-plan.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('patients/:patientId/diet-plans')
export class DietPlanController {
  constructor(private readonly createDietPlan: CreateDietPlanUseCase) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateDietPlanDto,
  ) {
    return this.createDietPlan.execute(patientId, dto);
  }
}
