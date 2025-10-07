import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Patient } from './patient.entity';

@Entity('anamneses')
export class Anamnesis extends BaseEntity {
  @ManyToOne(() => Patient, (p) => p.anamneses, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'text' })
  objectives!: string;

  @Column({ name: 'health_history', type: 'text', nullable: true })
  healthHistory?: string;

  @Column({ name: 'food_preferences', type: 'text', nullable: true })
  foodPreferences?: string;

  @Column({ name: 'lifestyle', type: 'text', nullable: true })
  lifestyle?: string;
}
