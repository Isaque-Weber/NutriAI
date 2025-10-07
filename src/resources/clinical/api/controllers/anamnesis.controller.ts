import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateAnamnesisDto } from '../dtos/create-anamnesis.dto';
import { CreateAnamnesisUseCase } from '../../app/use-cases/anamnesis/create-anamnesis.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('patients/:patientId/anamneses')
export class AnamnesisController {
  constructor(private readonly createAnamnesis: CreateAnamnesisUseCase) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateAnamnesisDto,
  ) {
    return this.createAnamnesis.execute(patientId, dto);
  }
}
