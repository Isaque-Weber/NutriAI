import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMessage } from './domain/entities/ai-message.entity';
import { AiMessageRepository } from './domain/repositories/ai-message.repository';
import { OpenRouterProvider } from './infrastructure/providers/openrouter.provider';
import { GenerateReplyUseCase } from './app/use-cases/generate-reply.use-case';
import { AiController } from './api/controllers/ai.controller';

import { InferenceService } from './services/inference.service';
import { KnowledgeService } from './services/knowledge.service';
import { AutoRetrievalService } from './services/auto-retrieval.service';

import { ClinicalModule } from '../clinical/clinical.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiMessage]), ClinicalModule],
  controllers: [AiController],
  providers: [
    AiMessageRepository,
    OpenRouterProvider,
    GenerateReplyUseCase,
    InferenceService,
    KnowledgeService,
    AutoRetrievalService,
  ],
  exports: [GenerateReplyUseCase, InferenceService],
})
export class AiModule {}
