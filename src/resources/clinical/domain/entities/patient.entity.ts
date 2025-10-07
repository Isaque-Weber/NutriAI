import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { User } from '../../../auth/domain/entities/user.entity';
import { Anamnesis } from './anamnesis.entity';
import { AnthropometricAssessment } from './anthropometric-assessment.entity';
import { DietPlan } from './diet-plan.entity';
import { ClinicalNote } from './clinical-note.entity';

@Entity('patients')
export class Patient extends BaseEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  gender?: string;

  @ManyToOne(() => User, (user) => user.patients, { onDelete: 'CASCADE' })
  nutritionist!: User;

  @Column({ name: 'nutritionist_id' })
  nutritionistId!: string;

  @OneToMany(() => Anamnesis, (a) => a.patient)
  anamneses!: Anamnesis[];

  @OneToMany(() => AnthropometricAssessment, (a) => a.patient)
  assessments!: AnthropometricAssessment[];

  @OneToMany(() => DietPlan, (d) => d.patient)
  dietPlans!: DietPlan[];

  @OneToMany(() => ClinicalNote, (n) => n.patient)
  notes!: ClinicalNote[];
}
