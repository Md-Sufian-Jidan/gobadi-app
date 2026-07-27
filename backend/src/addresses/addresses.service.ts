import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: number, dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create({ ...dto, userId });

    if (dto.isDefault) {
      await this.clearDefaults(userId);
    } else {
      const count = await this.addressRepository.countBy({ userId });
      if (count === 0) {
        address.isDefault = true;
      }
    }

    return this.addressRepository.save(address);
  }

  async findAll(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }
    return address;
  }

  async update(id: number, userId: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (dto.isDefault && !address.isDefault) {
      await this.clearDefaults(userId);
    }

    Object.assign(address, dto);
    const saved = await this.addressRepository.save(address);

    // Ensure at least one default exists if we turned it off
    if (dto.isDefault === false && address.isDefault) {
      // It was default, but we set it to false
      await this.setNextDefault(userId, id);
    }

    return saved;
  }

  async remove(id: number, userId: number): Promise<void> {
    const address = await this.findOne(id, userId);
    const wasDefault = address.isDefault;

    await this.addressRepository.remove(address);

    if (wasDefault) {
      await this.setNextDefault(userId);
    }
  }

  private async clearDefaults(userId: number): Promise<void> {
    await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
  }

  private async setNextDefault(userId: number, excludeId?: number): Promise<void> {
    const query = this.addressRepository
      .createQueryBuilder('address')
      .where('address.userId = :userId', { userId });

    if (excludeId) {
      query.andWhere('address.id != :excludeId', { excludeId });
    }

    const nextAddress = await query.orderBy('address.createdAt', 'DESC').getOne();
    if (nextAddress) {
      nextAddress.isDefault = true;
      await this.addressRepository.save(nextAddress);
    }
  }
}
