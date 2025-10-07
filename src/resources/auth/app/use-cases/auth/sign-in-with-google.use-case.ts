import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../../@shared/abstractions/use-case/base.use-case';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import { RefreshToken } from '../../../domain/tokens/refresh.token';
import { AccessToken } from '../../../domain/tokens/access.token';
import { OrganizationMemberRepository } from '../../../../organizations/domain/repositories/organization-member.repository';

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
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {
    super();
  }

  async execute(
    input: SignInWithGoogleUseCaseInput,
  ): Promise<SignInWithGoogleUseCaseOutput> {
    const { userId } = input;

    const member =
      await this.organizationMemberRepository.findDefaultOrganizationByUserId(
        userId,
      );
    const accessToken = AccessToken.generateToken({
      sub: userId,
      organizationId: member?.organizationId ?? null,
    });
    const refreshToken = RefreshToken.generateToken({
      sub: userId,
      organizationId: member?.organizationId ?? null,
    });

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
