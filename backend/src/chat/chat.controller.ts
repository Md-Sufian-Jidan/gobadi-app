import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService, ChatMessageClientView } from './chat.service';
import { ConversationService } from './conversation.service';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/send-message.dto';
import { SendAttachmentMessageDto } from './dto/send-attachment-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { Conversation } from './conversation.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const IMAGE_MIME_PREFIX = 'image/';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationService,
    private readonly chatGateway: ChatGateway,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the current user's conversations" })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getConversations(
    @CurrentUser() user: JwtPayload,
  ): Promise<Conversation[]> {
    return this.conversationService.listForUser(user.sub, user.role);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'conversationId', required: false })
  @ApiOperation({ summary: 'List messages in a conversation' })
  @ApiResponse({ status: 200, description: 'List of chat messages' })
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Query('conversationId') conversationIdParam?: string,
  ): Promise<ChatMessageClientView[]> {
    const conversationId = await this.resolveConversationId(
      user,
      conversationIdParam,
    );
    return this.chatService.getMessages(conversationId);
  }

  @Post('message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a chat message' })
  @ApiResponse({ status: 201, description: 'Message created' })
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Body() body: SendMessageDto,
  ): Promise<ChatMessageClientView> {
    const conversationId = await this.resolveConversationId(
      user,
      body.conversationId?.toString(),
    );
    const saved = await this.chatService.sendMessage(
      user.sub,
      user.role,
      conversationId,
      body.text,
    );
    this.chatGateway.notifyConversation(
      conversationId,
      'messageReceived',
      saved,
    );
    await this.chatGateway.notifyConversationParticipants(
      conversationId,
      saved,
    );
    return saved;
  }

  @Post('message/attachment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendAttachmentMessageDto })
  @ApiOperation({
    summary: 'Send a chat message with an image/document attachment',
  })
  @ApiResponse({ status: 201, description: 'Message created' })
  async sendAttachmentMessage(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SendAttachmentMessageDto,
  ): Promise<ChatMessageClientView> {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const conversationId = await this.resolveConversationId(
      user,
      body.conversationId?.toString(),
    );

    const isImage = file.mimetype.startsWith(IMAGE_MIME_PREFIX);
    const uploadResult = await this.cloudinaryService.uploadFile(file.buffer, {
      folder: 'gobadi/chat',
      resourceType: isImage ? 'image' : 'raw',
    });

    const saved = await this.chatService.sendMessage(
      user.sub,
      user.role,
      conversationId,
      body.caption ?? '',
      {
        url: uploadResult.url,
        type: isImage ? 'image' : 'document',
        mimeType: file.mimetype,
      },
    );
    this.chatGateway.notifyConversation(
      conversationId,
      'messageReceived',
      saved,
    );
    await this.chatGateway.notifyConversationParticipants(
      conversationId,
      saved,
    );
    return saved;
  }

  @Patch('messages/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked read' })
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const updated = await this.chatService.markRead(
      parseInt(id, 10),
      user.sub,
      user.role,
    );
    this.chatGateway.notifyConversation(
      updated.conversationId,
      'messageStatusUpdate',
      {
        id: updated.id,
        status: updated.status,
      },
    );
    return updated;
  }

  private async resolveConversationId(
    user: JwtPayload,
    conversationIdParam?: string,
  ): Promise<number> {
    if (conversationIdParam) {
      const conversationId = parseInt(conversationIdParam, 10);
      const isParticipant = await this.conversationService.isParticipant(
        conversationId,
        user.sub,
        user.role,
      );
      if (!isParticipant) {
        throw new BadRequestException('Not a participant in this conversation');
      }
      return conversationId;
    }

    if (user.role !== UserRole.USER) {
      throw new BadRequestException('conversationId is required');
    }
    const conversation = await this.conversationService.findOrCreateForPatient(
      user.sub,
    );
    return conversation.id;
  }
}
