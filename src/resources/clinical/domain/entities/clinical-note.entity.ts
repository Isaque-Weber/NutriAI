import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Patient } from './patient.entity';

@Entity('clinical_notes')
export class ClinicalNote extends BaseEntity {
  @ManyToOne(() => Patient, (p) => p.notes, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'text' })
  content!: string;
}
