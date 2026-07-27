import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService, SearchResults } from './search.service';
import type { SearchType } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across animals, marketplace, doctors and alerts' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', required: false, enum: ['animals', 'marketplace', 'doctors', 'alerts'] })
  @ApiResponse({ status: 200, description: 'Search results grouped by type' })
  async search(
    @Query('q') q: string,
    @Query('type') type?: SearchType,
  ): Promise<Partial<SearchResults>> {
    return this.searchService.search(q, type);
  }
}
