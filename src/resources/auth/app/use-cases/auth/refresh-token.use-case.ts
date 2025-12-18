import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import { User } from '../../../domain/entities/user.entity';

import { ACCESS_TOKEN } from '../../../domain/tokens/access.token';
import { REFRESH_TOKEN } from '../../../domain/tokens/refresh.token';

import type { AccessTokenFactory } from '../../../domain/tokens/access.token';
import type { RefreshTokenFactory } from '../../../domain/tokens/refresh.token';

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

    @Inject(REFRESH_TOKEN)
    private readonly refreshTokenFactory: RefreshTokenFactory,

    @Inject(ACCESS_TOKEN)
    private readonly accessTokenFactory: AccessTokenFactory,
  ) {
    super();
  }

  async execute(
    input: RefreshTokenUseCaseInput,
  ): Promise<RefreshTokenUseCaseOutput> {
    let payload: { sub: string; organizationId: string | null };

    try {
      payload = this.refreshTokenFactory.verify(input.refreshToken);
    } catch {
      throw new UnauthorizedException('O refresh token é inválido.');
    }

    const user = await this.userRepository.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('O refresh token é inválido.');
    }

    /**
     * (Opcional, mas recomendado)
     * Validação contra banco para garantir que o refresh token não foi revogado
     */
    // const exists = await this.tokenRepository.exists(
    //   user.id,
    //   TokenType.REFRESH_TOKEN,
    //   input.refreshToken,
    // );
    // if (!exists) {
    //   throw new UnauthorizedException('Refresh token revogado');
    // }

    return this.generateCredentials(user, payload.organizationId);
  }

  private async generateCredentials(
    user: User,
    organizationId: string | null,
  ): Promise<RefreshTokenUseCaseOutput> {
    const payload = {
      sub: user.id,
      organizationId,
    };

    const accessToken = this.accessTokenFactory.sign(payload);
    const refreshToken = this.refreshTokenFactory.sign(payload);

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
