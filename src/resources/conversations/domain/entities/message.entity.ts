import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { Conversation } from './conversation.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => Conversation, (conv) => conv.messages, {
    onDelete: 'CASCADE',
  })
  conversation!: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId!: string;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl?: string;
}
