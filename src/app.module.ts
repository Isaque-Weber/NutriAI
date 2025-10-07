import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '../ormconfig';
import { AuthModule } from './resources/auth/auth.module';
import { ConversationsModule } from './resources/conversations/conversations.module';
import { ClinicalModule } from './resources/clinical/clinical.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormconfig.options,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    ConversationsModule,
    ClinicalModule,
  ],
})
export class AppModule {}
