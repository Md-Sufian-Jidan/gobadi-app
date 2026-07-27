import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService, SearchResults } from './search.service';
import type { SearchType } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary:
      'Global search across animals, marketplace, doctors and alerts. Powered by Meilisearch when configured (typo-tolerant, suitable for as-you-type autocomplete), falling back to database queries otherwise.',
  })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['animals', 'marketplace', 'doctors', 'alerts'],
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter marketplace results by category',
  })
  @ApiQuery({
    name: 'specialty',
    required: false,
    description: 'Filter doctor results by specialty',
  })
  @ApiResponse({ status: 200, description: 'Search results grouped by type' })
  async search(
    @Query('q') q: string,
    @Query('type') type: SearchType | undefined,
    @Query('category') category: string | undefined,
    @Query('specialty') specialty: string | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<Partial<SearchResults>> {
    return this.searchService.search(user.sub, q, type, {
      category,
      specialty,
    });
  }
}
