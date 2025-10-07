import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../@shared/abstractions/typeorm/base.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectRepository(User) repo: Repository<User>) {
    super(repo);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  listPatients(nutritionistId: string) {
    return this.repo.find({
      where: { nutritionistId },
    });
  }
}
