import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseUseCase } from '../../../../../@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';

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
  ) {
    super();
  }

  async execute(
    input: ResetPasswordUseCaseInput,
  ): Promise<ResetPasswordUseCaseOutput> {
    // 1. Buscar o utilizador pelo endereço eletrónico
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new UnprocessableEntityException('User not found');
    // 2. Buscar o ‘token’ pelo tipo e valor
    const token = await this.tokenRepository.findByUserIdAndType(
      user.id,
      TokenType.PASSWORD_RECOVER,
    );
    if (!token) throw new UnprocessableEntityException('Token not found');
    // 3. Verificar se o token pertence ao usuário
    if (token.value !== input.token)
      throw new UnauthorizedException('Invalid token');
    // 4. Atualizar a senha do utilizador
    await user.setPassword(input.password);
    await this.userRepository.save(user);
    // 5. Remover o token
    await this.tokenRepository.delete(token.id);
  }
}
