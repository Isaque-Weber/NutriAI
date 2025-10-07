import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './domain/entities/conversation.entity';
import { Message } from './domain/entities/message.entity';
import { ConversationRepository } from './domain/repositories/conversation.repository';
import { MessageRepository } from './domain/repositories/message.repository';
import { CreateConversationUseCase } from './app/use-cases/create-conversation.use-case';
import { ListConversationsUseCase } from './app/use-cases/list-conversations.use-case';
import { CreateMessageUseCase } from './app/use-cases/create-message.use-case';
import { ListMessagesUseCase } from './app/use-cases/list-messages.use-case';
import { ConversationController } from './api/controllers/conversation.controller';
import { MessageController } from './api/controllers/message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [ConversationController, MessageController],
  providers: [
    ConversationRepository,
    MessageRepository,
    CreateConversationUseCase,
    ListConversationsUseCase,
    CreateMessageUseCase,
    ListMessagesUseCase,
  ],
  exports: [ConversationRepository, MessageRepository],
})
export class ConversationsModule {}
