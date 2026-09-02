import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto, ReplyTicketDto } from './dto/support.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { UserRole } from '../users/user.entity';
import { SupportTicket } from './support-ticket.entity';
import { SupportTicketReply } from './support-ticket-reply.entity';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTicketDto,
  ): Promise<SupportTicket> {
    return this.supportService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "List user's own tickets" })
  async listUserTickets(
    @CurrentUser() user: JwtPayload,
  ): Promise<SupportTicket[]> {
    return this.supportService.listUserTickets(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details (owner or admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SupportTicket> {
    return this.supportService.getById(
      parseInt(id, 10),
      user.sub,
      user.role === UserRole.ADMIN,
    );
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a ticket (owner or admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async reply(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReplyTicketDto,
  ): Promise<SupportTicketReply> {
    return this.supportService.reply(
      parseInt(id, 10),
      user.sub,
      user.role === UserRole.ADMIN,
      dto,
    );
  }
}
