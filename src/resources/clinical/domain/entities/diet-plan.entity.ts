import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Patient } from './patient.entity';

@Entity('diet_plans')
export class DietPlan extends BaseEntity {
  @ManyToOne(() => Patient, (p) => p.dietPlans, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ name: 'objective', type: 'text', nullable: true })
  objective?: string;

  @Column({ name: 'total_calories', type: 'float', nullable: true })
  totalCalories?: number;

  @Column({ name: 'content', type: 'text' })
  content!: string; // texto gerado pela IA
}
