import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';

import { ACCESS_TOKEN } from '../../../domain/tokens/access.token';
import { REFRESH_TOKEN } from '../../../domain/tokens/refresh.token';

import type { AccessTokenFactory } from '../../../domain/tokens/access.token';
import type { RefreshTokenFactory } from '../../../domain/tokens/refresh.token';

export type SignInWithGoogleUseCaseInput = {
  userId: string;
};

export type SignInWithGoogleUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SignInWithGoogleUseCase extends BaseUseCase<
  SignInWithGoogleUseCaseInput,
  SignInWithGoogleUseCaseOutput
> {
  constructor(
    private readonly tokenRepository: TokenRepository,

    @Inject(ACCESS_TOKEN)
    private readonly accessTokenFactory: AccessTokenFactory,

    @Inject(REFRESH_TOKEN)
    private readonly refreshTokenFactory: RefreshTokenFactory,
  ) {
    super();
  }

  async execute(
    input: SignInWithGoogleUseCaseInput,
  ): Promise<SignInWithGoogleUseCaseOutput> {
    const { userId } = input;

    const payload = {
      sub: userId,
    };

    const accessToken = this.accessTokenFactory.sign(payload);
    const refreshToken = this.refreshTokenFactory.sign(payload);

    await this.tokenRepository.deleteByUserIdAndType(
      userId,
      TokenType.REFRESH_TOKEN,
    );

    await this.tokenRepository.createToken(
      userId,
      TokenType.REFRESH_TOKEN,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
