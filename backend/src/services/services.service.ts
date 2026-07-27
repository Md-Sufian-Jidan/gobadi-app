import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ProviderType } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(dto);
    return this.serviceRepository.save(service);
  }

  async findAll(providerType?: ProviderType, providerId?: number): Promise<Service[]> {
    const where: any = { isActive: true };
    if (providerType) where.providerType = providerType;
    if (providerId) where.providerId = providerId;

    return this.serviceRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: number, dto: Partial<CreateServiceDto>): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    service.isActive = false;
    await this.serviceRepository.save(service);
  }
}
