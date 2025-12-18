import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import databaseConfig from '@config/database/database.config';
import jwtConfig from '@config/jwt/jwt.config';
import { envValidationSchema } from '@config/envs/env.validation';

import { AuthModule } from '@resources/auth/auth.module';
import { ClinicalModule } from '@resources/clinical/clinical.module';
import { ConversationsModule } from '@resources/conversations/conversations.module';

@Module({
  imports: [
    // Config global com validação de .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      validationSchema: envValidationSchema,
    }),

    // Banco de dados Postgres via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>(
          'database',
        ) as TypeOrmModuleOptions,
    }),

    // Módulos da aplicação
    AuthModule,
    ClinicalModule,
    ConversationsModule,
  ],
})
export class AppModule {}
