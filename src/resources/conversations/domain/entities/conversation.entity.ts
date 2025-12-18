import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Message } from './message.entity';
import { Patient } from '../../../clinical/domain/entities/patient.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'last_message_date', type: 'timestamp', nullable: true })
  lastMessageDate?: Date;

  @OneToMany(() => Message, (msg) => msg.conversation)
  messages!: Message[];

  addMessage(msg: Partial<Message>) {
    if (!this.messages) this.messages = [];
    const message = new Message();
    Object.assign(message, msg);
    message.conversation = this;
    this.messages.push(message);
    return message;
  }
}
