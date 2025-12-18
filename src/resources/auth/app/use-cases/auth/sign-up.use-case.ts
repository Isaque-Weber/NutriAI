import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import Hasher from '@shared/utils/hasher/hasher';

import { ACCESS_TOKEN } from '../../../domain/tokens/access.token';
import { REFRESH_TOKEN } from '../../../domain/tokens/refresh.token';

import type { AccessTokenFactory } from '../../../domain/tokens/access.token';
import type { RefreshTokenFactory } from '../../../domain/tokens/refresh.token';

export type SignUpUseCaseInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  avatarUrl?: string;
};

export type SignUpUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SignUpUseCase extends BaseUseCase<
  SignUpUseCaseInput,
  SignUpUseCaseOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,

    @Inject(ACCESS_TOKEN)
    private readonly accessTokenFactory: AccessTokenFactory,

    @Inject(REFRESH_TOKEN)
    private readonly refreshTokenFactory: RefreshTokenFactory,
  ) {
    super();
  }

  async execute(input: SignUpUseCaseInput): Promise<SignUpUseCaseOutput> {
    const { firstName, lastName, email, phoneNumber, password, avatarUrl } =
      input;

    // 1. Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // 2. Hash da senha
    const hashedPassword = await Hasher.generateHash(password);

    // 3. Criar usuário
    const user = await this.userRepository.createAndSave({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      avatarUrl,
    });

    const payload = {
      sub: user.id,
      organizationId: null,
    };

    // 4. Gerar tokens
    const accessToken = this.accessTokenFactory.sign(payload);
    const refreshToken = this.refreshTokenFactory.sign(payload);

    // 5. Persistir refresh token
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
