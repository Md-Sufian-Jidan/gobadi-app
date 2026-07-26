import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from './chat-message.entity';
import { Conversation } from './conversation.entity';
import { ChatGateway } from './chat.gateway';
import { ConversationService } from './conversation.service';
import { Appointment } from '../appointments/appointment.entity';
import { Doctor } from '../doctors/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Conversation, Appointment, Doctor]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ConversationService],
  exports: [ChatService, ChatGateway, ConversationService],
})
export class ChatModule {}
