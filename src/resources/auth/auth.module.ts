import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '@config/jwt/jwt.config';

import { AuthController } from './api/controllers/auth.controller';
import { UserController } from './api/controllers/user.controller';

import { User } from './domain/entities/user.entity';
import { Account } from './domain/entities/account.entity';
import { Token } from './domain/entities/token.entity';

import { UserRepository } from './domain/repositories/user.repository';
import { AccountRepository } from './domain/repositories/account.repository';
import { TokenRepository } from './domain/repositories/token.repository';

import { AccessToken } from './domain/tokens/access.token';
import { RefreshToken } from './domain/tokens/refresh.token';
import { RecoverPasswordToken } from './domain/tokens/recover-password.token';

import { JwtStrategy } from './infrastructure/passport/jwt.strategy';
import { GoogleStrategy } from './infrastructure/passport/google.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './infrastructure/guards/google-auth.guard';

import { SignInUseCase } from './app/use-cases/auth/sign-in.use-case';
import { SignUpUseCase } from './app/use-cases/auth/sign-up.use-case';
import { RefreshTokenUseCase } from './app/use-cases/auth/refresh-token.use-case';
import { RecoverPasswordUseCase } from './app/use-cases/auth/recover-password.use-case';
import { GetUserProfileUseCase } from './app/use-cases/user/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './app/use-cases/user/update-user-profile.use-case';

@Module({
  imports: [
    // JWT config isolado
    ConfigModule.forFeature(jwtConfig),

    // Entidades do TypeORM
    TypeOrmModule.forFeature([User, Account, Token]),

    // JWT com config dinâmico
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
    }),
  ],

  controllers: [AuthController, UserController],

  providers: [
    // Repositórios
    UserRepository,
    AccountRepository,
    TokenRepository,

    // Tokens e estratégias
    AccessToken,
    RefreshToken,
    RecoverPasswordToken,
    JwtStrategy,
    GoogleStrategy,

    // Guards
    JwtAuthGuard,
    GoogleAuthGuard,

    // Casos de uso
    SignInUseCase,
    SignUpUseCase,
    RefreshTokenUseCase,
    RecoverPasswordUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],

  exports: [
    JwtModule,
    AccessToken,
    RefreshToken,
    UserRepository,
    AccountRepository,
    TokenRepository,
  ],
})
export class AuthModule {}
