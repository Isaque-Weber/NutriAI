import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMessage } from './domain/entities/ai-message.entity';
import { AiMessageRepository } from './domain/repositories/ai-message.repository';
import { OpenRouterProvider } from './infrastructure/providers/openrouter.provider';
import { GenerateReplyUseCase } from './app/use-cases/generate-reply.use-case';
import { AiController } from './api/controllers/ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiMessage])],
  controllers: [AiController],
  providers: [AiMessageRepository, OpenRouterProvider, GenerateReplyUseCase],
  exports: [GenerateReplyUseCase],
})
export class AiModule {}
