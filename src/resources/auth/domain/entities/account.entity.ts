import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../@shared/abstractions/typeorm/base.entity';
import { User } from './user.entity';

export enum AccountProvider {
  GOOGLE = 'GOOGLE',
}

@Entity('accounts')
export class Account extends BaseEntity {
  @Column({ type: 'enum', enum: AccountProvider })
  provider!: AccountProvider;

  @Column({ name: 'provider_account_id' })
  providerAccountId!: string;

  @Column({ name: 'provider_avatar_url', nullable: true })
  providerAvatarUrl?: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;
}
