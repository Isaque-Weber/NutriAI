import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { RegisterNutritionistUseCase } from '../../app/use-cases/auth/register-nutritionist.use-case';
import { CreatePatientUseCase } from '../../app/use-cases/user/create-patient.use-case';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerNutritionist: RegisterNutritionistUseCase,
    private readonly createPatientUseCase: CreatePatientUseCase,
  ) {}

  @Post('register')
  async register(@Body() body) {
    return this.registerNutritionist.execute(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NUTRITIONIST)
  @Post('patients')
  async createPatient(@Request() req, @Body() body) {
    const nutritionistId = req.user.id;
    return this.createPatientUseCase.execute({ ...body, nutritionistId });
  }
}
