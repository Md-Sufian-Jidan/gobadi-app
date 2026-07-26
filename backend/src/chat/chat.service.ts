import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, MessageStatus } from './chat-message.entity';
import { ConversationService } from './conversation.service';
import { UserRole } from '../users/user.entity';
export { ChatMessage } from './chat-message.entity';

export interface ChatMessageClientView {
  id: number;
  conversationId: number;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
  createdAt: Date;
  status: MessageStatus;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly conversationService: ConversationService,
  ) {}

  async getMessages(conversationId: number): Promise<ChatMessageClientView[]> {
    const messages = await this.chatMessageRepository.find({
      where: { conversationId },
      order: { id: 'ASC' },
    });
    return messages.map((m) => this.toClientView(m));
  }

  async sendMessage(
    senderId: number,
    senderRole: UserRole,
    conversationId: number,
    text: string,
  ): Promise<ChatMessageClientView> {
    if (!text || !text.trim()) {
      throw new BadRequestException('Message text cannot be empty');
    }
    const newMessage = this.chatMessageRepository.create({
      conversationId,
      senderId,
      senderRole,
      text,
      status: MessageStatus.SENT,
    });
    const saved = await this.chatMessageRepository.save(newMessage);
    await this.conversationService.touchLastMessageAt(conversationId);
    return this.toClientView(saved);
  }

  async markDelivered(messageId: number): Promise<ChatMessage> {
    await this.chatMessageRepository.update(messageId, {
      status: MessageStatus.DELIVERED,
      deliveredAt: new Date(),
    });
    return this.chatMessageRepository.findOneByOrFail({ id: messageId });
  }

  async markRead(messageId: number): Promise<ChatMessage> {
    await this.chatMessageRepository.update(messageId, {
      status: MessageStatus.READ,
      readAt: new Date(),
    });
    return this.chatMessageRepository.findOneByOrFail({ id: messageId });
  }

  private toClientView(message: ChatMessage): ChatMessageClientView {
    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: message.senderRole === UserRole.DOCTOR ? 'doctor' : 'user',
      text: message.text,
      time: message.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: message.createdAt,
      status: message.status,
    };
  }
}
