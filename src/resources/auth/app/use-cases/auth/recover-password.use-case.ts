import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import { RecoverPasswordEmail } from '../../../domain/emails/recover-password.email';
import { env } from '@config/envs/env.validation';
import { RECOVER_PASSWORD_TOKEN } from '../../../domain/tokens/recover-password.token';
import type { RecoverPasswordTokenFactory } from '../../../domain/tokens/recover-password.token';

export type RecoverPasswordUseCaseInput = {
  email: string;
};

export type RecoverPasswordUseCaseOutput = void;

@Injectable()
export class RecoverPasswordUseCase extends BaseUseCase<
  RecoverPasswordUseCaseInput,
  RecoverPasswordUseCaseOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,

    @Inject(RECOVER_PASSWORD_TOKEN)
    private readonly recoverPasswordToken: RecoverPasswordTokenFactory,
  ) {
    super();
  }

  async execute(
    input: RecoverPasswordUseCaseInput,
  ): Promise<RecoverPasswordUseCaseOutput> {
    const { email } = input;

    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const token = this.recoverPasswordToken.sign({
      sub: user.id,
      email: user.email,
    });

    await this.tokenRepository.deleteByUserIdAndType(
      user.id,
      TokenType.PASSWORD_RECOVER,
    );

    await this.tokenRepository.createToken(
      user.id,
      TokenType.PASSWORD_RECOVER,
      token,
    );

    await RecoverPasswordEmail.send({
      to: email,
      dynamicTemplateData: {
        username: `${user.firstName} ${user.lastName}`,
        token,
        email: user.email,
        frontend_url: env.FRONTEND_URL,
      },
    });
  }
}
