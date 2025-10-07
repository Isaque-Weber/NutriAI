import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../@shared/decorators/roles.decorators';
import { UserRole } from '../../../../@shared/enums/user-role.enum';
import { CreateClinicalNoteDto } from '../dtos/create-clinical-note.dto';
import { CreateClinicalNoteUseCase } from '../../app/use-cases/clinical-note/create-clinical-note.use-case';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NUTRITIONIST)
@Controller('patients/:patientId/notes')
export class ClinicalNoteController {
  constructor(private readonly createNote: CreateClinicalNoteUseCase) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateClinicalNoteDto,
  ) {
    return this.createNote.execute(patientId, dto);
  }
}
