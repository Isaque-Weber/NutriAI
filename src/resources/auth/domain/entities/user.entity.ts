import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/abstractions/typeorm/base.entity';
import { Account } from './account.entity';
import { Token } from './token.entity';
import { UserRole } from '@shared/enums/user-role.enum';
import Hasher from '@shared/utils/hasher/hasher';
import { UnauthorizedException } from '@nestjs/common';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'uuid', nullable: true })
  nutritionistId?: string;

  @ManyToOne(() => User, (user) => user.patients)
  nutritionist?: User;

  @OneToMany(() => User, (user) => user.nutritionist)
  patients: User[];

  @OneToMany(() => Account, (acc) => acc.user)
  accounts: Account[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  async setPassword(password: string): Promise<void> {
    this.password = await Hasher.generateHash(password);
  }

  async checkPassword(password: string): Promise<boolean> {
    if (!this.password) throw new UnauthorizedException();
    return Hasher.validatePassword(password, this.password);
  }
}
