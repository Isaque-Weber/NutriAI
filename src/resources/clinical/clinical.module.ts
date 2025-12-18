import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './domain/entities/patient.entity';
import { Anamnesis } from './domain/entities/anamnesis.entity';
import { AnthropometricAssessment } from './domain/entities/anthropometric-assessment.entity';
import { DietPlan } from './domain/entities/diet-plan.entity';
import { ClinicalNote } from './domain/entities/clinical-note.entity';
import { PatientRepository } from './domain/repositories/patient.repository';
import { AnamnesisRepository } from './domain/repositories/anamnesis.repository';
import { AnthropometricAssessmentRepository } from './domain/repositories/anthropometric-assessment.repository';
import { DietPlanRepository } from './domain/repositories/diet-plan.repository';
import { ClinicalNoteRepository } from './domain/repositories/clinical-note.repository';

import { PatientController } from './api/controllers/patient.controller';
import { AnamnesisController } from './api/controllers/anamnesis.controller';
import { AnthropometricController } from './api/controllers/anthropometric.controller';
import { DietPlanController } from './api/controllers/diet-plan.controller';
import { ClinicalNoteController } from './api/controllers/clinical-note.controller';
import { PatientService } from './services/patient.service';
import { AnthropometricAssessmentService } from './services/anthropometric-assessment.service';
import { AnamnesisService } from './services/anamnesis.service';
import { DietPlanService } from './services/dietplan.service';
import { ClinicalNoteService } from './services/clinical-note.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Anamnesis,
      AnthropometricAssessment,
      DietPlan,
      ClinicalNote,
    ]),
  ],
  controllers: [
    PatientController,
    AnamnesisController,
    AnthropometricController,
    DietPlanController,
    ClinicalNoteController,
  ],
  providers: [
    PatientRepository,
    AnamnesisRepository,
    AnthropometricAssessmentRepository,
    DietPlanRepository,
    ClinicalNoteRepository,
    PatientService,
    AnthropometricAssessmentService,
    AnamnesisService,
    DietPlanService,
    ClinicalNoteService,
  ],
  exports: [
    PatientRepository,
    AnamnesisRepository,
    AnthropometricAssessmentRepository,
    DietPlanRepository,
    ClinicalNoteRepository,
    PatientService,
    AnthropometricAssessmentService,
    AnamnesisService,
    DietPlanService,
    ClinicalNoteService,
  ],
})
export class ClinicalModule {}
