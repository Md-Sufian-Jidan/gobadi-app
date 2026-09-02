import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { Faq } from './faq.entity';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: 'List FAQs (optionally filter by category)' })
  @ApiQuery({ name: 'category', required: false })
  async list(@Query('category') category?: string): Promise<Faq[]> {
    return this.faqsService.list(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single FAQ' })
  @ApiParam({ name: 'id', example: '1' })
  async getById(@Param('id') id: string): Promise<Faq> {
    return this.faqsService.getById(parseInt(id, 10));
  }
}
