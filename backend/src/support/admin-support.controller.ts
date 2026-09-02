import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { UpdateTicketStatusDto } from './dto/support.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { SupportTicket } from './support-ticket.entity';

@ApiTags('admin/support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/support/tickets')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'List all support tickets' })
  async listAll(): Promise<SupportTicket[]> {
    return this.supportService.listAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', example: '1' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ): Promise<SupportTicket> {
    return this.supportService.updateStatus(parseInt(id, 10), dto);
  }
}
