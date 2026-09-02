import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Faq } from './faq.entity';

@ApiTags('admin/faqs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ created' })
  async create(@Body() dto: CreateFaqDto): Promise<Faq> {
    return this.faqsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an FAQ' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateFaqDto>,
  ): Promise<Faq> {
    return this.faqsService.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.faqsService.remove(parseInt(id, 10));
    return { success: true };
  }
}
