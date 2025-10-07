import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { Account } from './domain/entities/account.entity';
import { Token } from './domain/entities/token.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { RegisterNutritionistUseCase } from './app/use-cases/auth/register-nutritionist.use-case';
import { CreatePatientUseCase } from './app/use-cases/user/create-patient.use-case';
import { AuthController } from './api/controllers/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Token])],
  controllers: [AuthController],
  providers: [
    UserRepository,
    RegisterNutritionistUseCase,
    CreatePatientUseCase,
  ],
  exports: [UserRepository],
})
export class AuthModule {}
