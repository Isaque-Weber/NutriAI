import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { TokenType } from '../entities/token.entity';
import { BaseRepository } from '@shared/abstractions/typeorm/base.repository';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  constructor(@InjectRepository(Token) repo: Repository<Token>) {
    super(repo);
  }

  createToken(userId: string, type: TokenType, token: string) {
    return this.repo.save({ userId, type, value: token });
  }

  findByValue(value: string): Promise<Token | null> {
    return this.repo.findOne({ where: { value } });
  }

  deleteByUserIdAndType(userId: string, type: TokenType) {
    return this.repo.delete({ userId, type });
  }

  async revokeAllTokens(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  async findValidRefreshToken(userId: string): Promise<Token | null> {
    return this.repo.findOne({
      where: {
        userId,
        type: TokenType.REFRESH_TOKEN,
      },
    });
  }
}
