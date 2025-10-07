import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { User } from './user.entity';

export enum TokenType {
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  PASSWORD_RECOVER = 'PASSWORD_RECOVER',
}

@Entity('tokens')
export class Token extends BaseEntity {
  @Column({ type: 'enum', enum: TokenType })
  type!: TokenType;

  @Column()
  value!: string;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;
}
