import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Mixed global search across products, livestock, clinics, and doctors' })
  @ApiQuery({ name: 'q', example: 'cattle', description: 'Query text' })
  @ApiResponse({ status: 200, description: 'Aggregated search results' })
  async globalSearch(@Query('q') q: string) {
    return this.searchService.globalSearch(q || '');
  }
}
