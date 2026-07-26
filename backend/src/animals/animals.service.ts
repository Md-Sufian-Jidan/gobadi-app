import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from './animal.entity';
export { Animal } from './animal.entity';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
  ) {}

  async getAnimals(): Promise<Animal[]> {
    return this.animalRepository.find({ order: { id: 'ASC' } });
  }

  async getAnimalById(id: string): Promise<Animal> {
    const animal = await this.animalRepository.findOneBy({
      id: parseInt(id, 10),
    });
    if (!animal) {
      throw new BadRequestException('Animal not found');
    }
    return animal;
  }

  async addAnimal(data: Omit<Animal, 'id'>): Promise<Animal> {
    if (!data.name || !data.breed) {
      throw new BadRequestException('Name and Breed are required');
    }
    const newAnimal = this.animalRepository.create(data);
    return this.animalRepository.save(newAnimal);
  }
}
