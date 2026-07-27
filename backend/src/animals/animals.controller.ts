import {
  Controller,
  Get,
  Post,
  Param,
  Body,
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
import { AnimalsService, Animal } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  @ApiOperation({ summary: 'List all animals' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of animals' })
  async getAnimals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Animal[] | PaginatedResult<Animal>> {
    return this.animalsService.getAnimals(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an animal by id' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'The animal' })
  async getAnimalById(@Param('id') id: string): Promise<Animal> {
    return this.animalsService.getAnimalById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new animal' })
  @ApiResponse({ status: 201, description: 'Animal created' })
  async addAnimal(@Body() body: CreateAnimalDto): Promise<Animal> {
    return this.animalsService.addAnimal(body);
  }
}
