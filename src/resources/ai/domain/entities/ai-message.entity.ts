import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/abstractions/typeorm/base.entity';
import { Conversation } from '../../../conversations/domain/entities/conversation.entity';

@Entity('ai_messages')
export class AiMessage extends BaseEntity {
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  conversation!: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId!: string;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({ name: 'model', type: 'varchar', default: 'gpt-4o-mini' })
  model!: string;

  @Column({ name: 'provider', type: 'varchar', default: 'openrouter' })
  provider!: string;
}
