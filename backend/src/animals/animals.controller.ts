import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnimalsService, Animal } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';

@ApiTags('animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  @ApiOperation({ summary: 'List all animals' })
  @ApiResponse({ status: 200, description: 'List of animals' })
  async getAnimals(): Promise<Animal[]> {
    return this.animalsService.getAnimals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an animal by id' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'The animal' })
  async getAnimalById(@Param('id') id: string): Promise<Animal> {
    return this.animalsService.getAnimalById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new animal' })
  @ApiResponse({ status: 201, description: 'Animal created' })
  async addAnimal(@Body() body: CreateAnimalDto): Promise<Animal> {
    return this.animalsService.addAnimal(body);
  }
}
