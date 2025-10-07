import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Patient } from './patient.entity';

@Entity('anthropometric_assessments')
export class AnthropometricAssessment extends BaseEntity {
  @ManyToOne(() => Patient, (p) => p.assessments, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'float' })
  weight!: number;

  @Column({ type: 'float' })
  height!: number;

  @Column({ name: 'body_fat', type: 'float', nullable: true })
  bodyFat?: number;

  @Column({ name: 'waist', type: 'float', nullable: true })
  waist?: number;

  @Column({ name: 'hip', type: 'float', nullable: true })
  hip?: number;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes?: string;
}
