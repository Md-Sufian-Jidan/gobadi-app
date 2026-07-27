import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Animal } from './animal.entity';
import { PaginatedResult } from '../common/paginated-result.interface';
export { Animal } from './animal.entity';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
  ) {}

  async getAnimals(
    page?: number,
    limit?: number,
  ): Promise<Animal[] | PaginatedResult<Animal>> {
    if (!page && !limit) {
      return this.animalRepository.find({ order: { id: 'ASC' } });
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const [data, total] = await this.animalRepository.findAndCount({
      order: { id: 'ASC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { data, page: currentPage, limit: pageSize, total };
  }

  async search(q: string): Promise<Animal[]> {
    if (!q) {
      return [];
    }
    return this.animalRepository.find({
      where: [{ name: ILike(`%${q}%`) }, { breed: ILike(`%${q}%`) }],
      take: 10,
    });
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
