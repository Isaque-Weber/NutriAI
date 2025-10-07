import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { CreatePatientUseCase } from '../../app/use-cases/patient/create-patient.use-case';
import { ListPatientsUseCase } from '../../app/use-cases/patient/list-patients.use-case';
import { GetPatientByIdUseCase } from '../../app/use-cases/patient/get-patient-by-id.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('patients')
export class PatientController {
  constructor(
    private readonly createPatient: CreatePatientUseCase,
    private readonly listPatients: ListPatientsUseCase,
    private readonly getPatientById: GetPatientByIdUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreatePatientDto, @Request() req) {
    return this.createPatient.execute(dto, req.user.id);
  }

  @Get()
  list(@Request() req) {
    return this.listPatients.execute(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Request() req) {
    return this.getPatientById.execute(id, req.user.id);
  }
}
