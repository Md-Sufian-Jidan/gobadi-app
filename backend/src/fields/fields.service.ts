import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from './field.entity';
import { CreateFieldDto } from './dto/create-field.dto';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
  ) {}

  async list(userId: number): Promise<Field[]> {
    return this.fieldRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateFieldDto): Promise<Field> {
    return this.fieldRepository.save(
      this.fieldRepository.create({
        userId,
        name: dto.name,
        sizeAcres: dto.sizeAcres,
        cropType: dto.cropType,
        location: dto.location,
      }),
    );
  }

  async update(
    id: number,
    userId: number,
    dto: Partial<CreateFieldDto>,
  ): Promise<Field> {
    const field = await this.fieldRepository.findOneBy({ id });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name !== undefined) field.name = dto.name;
    if (dto.sizeAcres !== undefined) field.sizeAcres = dto.sizeAcres;
    if (dto.cropType !== undefined) field.cropType = dto.cropType;
    if (dto.location !== undefined) field.location = dto.location;

    return this.fieldRepository.save(field);
  }

  async remove(id: number, userId: number): Promise<void> {
    const field = await this.fieldRepository.findOneBy({ id });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.fieldRepository.remove(field);
  }
}
