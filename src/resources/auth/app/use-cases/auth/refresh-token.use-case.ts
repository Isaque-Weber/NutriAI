import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseUseCase } from '../../../../../@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { Token, TokenType } from '../../../domain/entities/token.entity';
import { RefreshToken } from '../../../domain/tokens/refresh.token';
import { User } from '../../../domain/entities/user.entity';
import { AccessToken } from '../../../domain/tokens/access.token';
import { SignInUseCaseOutput } from './sign-in.use-case';

export type RefreshTokenUseCaseInput = {
  refreshToken: string;
};

export type RefreshTokenUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenUseCase extends BaseUseCase<
  RefreshTokenUseCaseInput,
  RefreshTokenUseCaseOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {
    super();
  }

  async execute(
    input: RefreshTokenUseCaseInput,
  ): Promise<RefreshTokenUseCaseOutput> {
    const payload = RefreshToken.verifyToken(input.refreshToken);

    const user = await this.userRepository.findOneById(payload.sub, {
      relations: ['tokens'],
    });

    if (!user) throw new UnauthorizedException('O refresh token é inválido.');

    // const userRefreshToken = user.tokens.find((token: Token) => token.type === TokenType.REFRESH_TOKEN && token.value === input.refreshToken);
    // if (!userRefreshToken) throw new UnauthorizedException('Autenticação inválida');

    return this.generateCredentials(user, payload.organizationId ?? null);
  }

  async generateCredentials(
    user: User,
    organizationId: string | null,
  ): Promise<SignInUseCaseOutput> {
    const accessToken = AccessToken.generateToken({
      sub: user.id,
      organizationId,
    });
    const refreshToken = RefreshToken.generateToken({
      sub: user.id,
      organizationId,
    });

    await this.tokenRepository.deleteByUserIdAndType(
      user.id,
      TokenType.REFRESH_TOKEN,
    );
    await this.tokenRepository.createToken(
      user.id,
      TokenType.REFRESH_TOKEN,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
