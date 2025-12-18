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

export type SignInUseCaseInput = {
  email: string;
  password: string;
};

export type SignInUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SignInUseCase extends BaseUseCase<
  SignInUseCaseInput,
  SignInUseCaseOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,

    @Inject(ACCESS_TOKEN)
    private readonly accessToken: AccessTokenFactory,

    @Inject(REFRESH_TOKEN)
    private readonly refreshToken: RefreshTokenFactory,
  ) {
    super();
  }

  async execute(input: SignInUseCaseInput): Promise<SignInUseCaseOutput> {
    const { email, password } = input;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('This account requires social login');
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateCredentials(user);
  }

  private async generateCredentials(user: User): Promise<SignInUseCaseOutput> {
    const payload = {
      sub: user.id,
    };

    const accessToken = this.accessToken.sign(payload);
    const refreshToken = this.refreshToken.sign(payload);

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
