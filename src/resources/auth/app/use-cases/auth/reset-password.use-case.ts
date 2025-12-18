import {
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';

import { RECOVER_PASSWORD_TOKEN } from '../../../domain/tokens/recover-password.token';
import type {
  RecoverPasswordTokenFactory,
  RecoverPasswordTokenPayload,
} from '../../../domain/tokens/recover-password.token';

export type ResetPasswordUseCaseInput = {
  email: string;
  password: string;
  token: string;
};

export type ResetPasswordUseCaseOutput = void;

@Injectable()
export class ResetPasswordUseCase extends BaseUseCase<
  ResetPasswordUseCaseInput,
  ResetPasswordUseCaseOutput
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
    input: ResetPasswordUseCaseInput,
  ): Promise<ResetPasswordUseCaseOutput> {
    const { email, password, token } = input;

    // 1. Buscar usuário
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }

    // 2. Validar JWT (assinatura + expiração)
    let payload: RecoverPasswordTokenPayload;

    try {
      payload = this.recoverPasswordToken.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 3. Garantir que o token pertence ao usuário certo
    if (payload.sub !== user.id || payload.email !== user.email) {
      throw new UnauthorizedException('Invalid token');
    }

    // 4. Buscar token persistido (revogação / uso único)
    const storedToken = await this.tokenRepository.findByUserIdAndType(
      user.id,
      TokenType.PASSWORD_RECOVER,
    );

    if (!storedToken || storedToken.value !== token) {
      throw new UnauthorizedException('Token not found or already used');
    }

    // 5. Atualizar senha
    await user.setPassword(password);
    await this.userRepository.save(user);

    // 6. Invalidar token
    await this.tokenRepository.delete(storedToken.id);
  }
}
