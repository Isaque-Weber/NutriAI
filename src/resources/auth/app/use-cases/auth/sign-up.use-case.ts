import { ConflictException, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../../@shared/abstractions/use-case/base.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenRepository } from '../../../domain/repositories/token.repository';
import { TokenType } from '../../../domain/entities/token.entity';
import Hasher from '../../../../../@shared/utils/hasher/hasher';
import { AccessToken } from '../../../domain/tokens/access.token';
import { RefreshToken } from '../../../domain/tokens/refresh.token';

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
  ) {
    super();
  }

  async execute(input: SignUpUseCaseInput): Promise<SignUpUseCaseOutput> {
    const { firstName, lastName, email, phoneNumber, password, avatarUrl } =
      input;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await Hasher.generateHash(password);

    // Create user
    const user = await this.userRepository.createAndSave({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      avatarUrl,
    });

    const accessToken = AccessToken.generateToken({
      sub: user.id,
      organizationId: null,
    });

    const refreshToken = RefreshToken.generateToken({
      sub: user.id,
      organizationId: null,
    });

    // Save refresh token
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
