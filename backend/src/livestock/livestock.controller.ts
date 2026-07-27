import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LivestockService } from './livestock.service';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { Livestock } from './livestock.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('livestock')
@Controller('livestock')
export class LivestockController {
  constructor(private readonly livestockService: LivestockService) {}

  @Get('featured')
  @ApiOperation({ summary: 'List top featured livestock listings' })
  @ApiResponse({ status: 200, description: 'List of featured listings' })
  async getFeatured(): Promise<Livestock[]> {
    return this.livestockService.getFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search livestock listings' })
  @ApiQuery({ name: 'q', example: 'Holstein' })
  @ApiQuery({ name: 'species', required: false })
  @ApiResponse({ status: 200, description: 'Matching listings' })
  async search(
    @Query('q') q: string,
    @Query('species') species?: string,
  ): Promise<Livestock[]> {
    return this.livestockService.search(q, species);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List current seller's own listings" })
  @ApiResponse({ status: 200, description: 'Seller listings' })
  async getMyListings(
    @CurrentUser() user: JwtPayload,
  ): Promise<Livestock[]> {
    return this.livestockService.getMyListings(user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List active livestock with optional pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'species', required: false })
  @ApiQuery({ name: 'breed', required: false })
  @ApiResponse({ status: 200, description: 'Listings catalog' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('species') species?: string,
    @Query('breed') breed?: string,
  ): Promise<Livestock[] | PaginatedResult<Livestock>> {
    return this.livestockService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      species,
      breed,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single livestock listing' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Details of listing' })
  async findOne(@Param('id') id: string): Promise<Livestock> {
    return this.livestockService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new livestock listing' })
  @ApiResponse({ status: 201, description: 'Listing created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateLivestockDto,
  ): Promise<Livestock> {
    return this.livestockService.create(user.sub, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing listing (Owner only)' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLivestockDto,
  ): Promise<Livestock> {
    return this.livestockService.update(parseInt(id, 10), user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing (Owner only)' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.livestockService.remove(parseInt(id, 10), user.sub);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify/Unverify livestock listing (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async verifyListing(
    @Param('id') id: string,
    @Body() body: { isVerified: boolean },
  ): Promise<Livestock> {
    return this.livestockService.verifyListing(parseInt(id, 10), body.isVerified);
  }

  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set featured status (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async setFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ): Promise<Livestock> {
    return this.livestockService.setFeatured(parseInt(id, 10), body.isFeatured);
  }

  @Patch(':id/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve/Release a livestock listing (Owner only)' })
  @ApiParam({ name: 'id', example: '1' })
  async reserveListing(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { isReserved: boolean },
  ): Promise<Livestock> {
    // Basic verification that user is owner
    const listing = await this.livestockService.findOne(parseInt(id, 10));
    if (listing.sellerId !== user.sub) {
      throw new ForbiddenException('You do not own this listing');
    }
    return this.livestockService.reserveListing(listing.id, body.isReserved);
  }

  @Patch(':id/sold')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark listing as sold (Owner only)' })
  @ApiParam({ name: 'id', example: '1' })
  async markSold(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { isSold: boolean },
  ): Promise<Livestock> {
    const listing = await this.livestockService.findOne(parseInt(id, 10));
    if (listing.sellerId !== user.sub) {
      throw new ForbiddenException('You do not own this listing');
    }
    return this.livestockService.markSold(listing.id, body.isSold);
  }
}
