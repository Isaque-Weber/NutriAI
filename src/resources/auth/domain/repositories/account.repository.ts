import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';
import { AccountProvider } from '../entities/account.entity';

@Injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@InjectRepository(Account) repo: Repository<Account>) {
    super(repo);
  }

  findByProviderAndAccountId(
    provider: AccountProvider,
    providerAccountId: string,
  ) {
    return this.repo.findOne({ where: { provider, providerAccountId } });
  }

  findByUserId(userId: string) {
    return this.repo.find({ where: { userId } });
  }
}
