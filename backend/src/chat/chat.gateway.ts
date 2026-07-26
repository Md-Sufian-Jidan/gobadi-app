import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ConversationService } from './conversation.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      this.logger.warn(
        `Unauthorized WebSocket connection attempt: ${client.id}. Disconnecting.`,
      );
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      });
      client.data.user = payload;
      client.join(`user:${payload.sub}`);
      this.logger.log(
        `Authorized client connected: ${client.id} (user ${payload.sub})`,
      );
    } catch {
      this.logger.warn(
        `Invalid token on WebSocket connection: ${client.id}. Disconnecting.`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const user: JwtPayload = client.data.user;
    if (!user) {
      return;
    }
    const isParticipant = await this.conversationService.isParticipant(
      data.conversationId,
      user.sub,
      user.role,
    );
    if (!isParticipant) {
      return;
    }
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; text: string },
  ) {
    const user: JwtPayload = client.data.user;
    if (!user) {
      return;
    }
    const isParticipant = await this.conversationService.isParticipant(
      data.conversationId,
      user.sub,
      user.role,
    );
    if (!isParticipant) {
      return;
    }

    const savedMsg = await this.chatService.sendMessage(
      user.sub,
      user.role,
      data.conversationId,
      data.text,
    );
    this.notifyConversation(data.conversationId, 'messageReceived', savedMsg);
    return savedMsg;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const user: JwtPayload = client.data.user;
    if (!user) {
      return;
    }
    client.to(`conversation:${data.conversationId}`).emit('typingIndicator', {
      userId: user.sub,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(@MessageBody() data: { messageId: number }) {
    const updated = await this.chatService.markRead(data.messageId);
    this.notifyConversation(updated.conversationId, 'messageStatusUpdate', {
      id: updated.id,
      status: updated.status,
    });
  }

  notifyConversation(
    conversationId: number,
    event: string,
    payload: any,
  ): void {
    this.server.to(`conversation:${conversationId}`).emit(event, payload);
  }

  notifyUser(userId: number, event: string, payload: any): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
