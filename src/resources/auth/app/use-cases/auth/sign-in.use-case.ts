import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import { env } from '@config/envs/env.validation';
import { AccessToken } from '../../../domain/tokens/access.token';
import { RefreshToken } from '../../../domain/tokens/refresh.token';
import { User } from '../../../domain/entities/user.entity';
import { OrganizationMemberRepository } from '../../../../organizations/domain/repositories/organization-member.repositories';

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
    private readonly organizationMemberRepository: OrganizationMemberRepository,
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

  async generateCredentials(user: User): Promise<SignInUseCaseOutput> {
    const member =
      await this.organizationMemberRepository.findDefaultOrganizationByUserId(
        user.id,
      );
    const accessToken = AccessToken.generateToken({
      sub: user.id,
      organizationId: member?.organizationId ?? null,
    });
    const refreshToken = RefreshToken.generateToken({
      sub: user.id,
      organizationId: member?.organizationId ?? null,
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
