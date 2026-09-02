import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { PatientDiscount } from './patient-discount.entity';
import { Discount } from './discount.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Animal } from '../animals/animal.entity';
import { UsersService } from '../users/users.service';
export { PatientDiscount } from './patient-discount.entity';
export { Discount } from './discount.entity';

export interface DoctorPatient extends Animal {
  ownerName?: string;
  ownerAvatar?: string;
  discount?: PatientDiscount;
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(PatientDiscount)
    private readonly discountRepository: Repository<PatientDiscount>,
    @InjectRepository(Discount)
    private readonly promoDiscountRepository: Repository<Discount>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    private readonly usersService: UsersService,
  ) {}

  async getDoctorPatients(
    doctorId: number,
    search?: string,
    discountGiven?: boolean,
  ): Promise<DoctorPatient[]> {
    const appointments = await this.appointmentRepository.find({
      where: { doctorId },
      select: { animalId: true },
    });
    const patientIds = [
      ...new Set(appointments.map((a) => a.animalId).filter(Boolean)),
    ] as number[];
    if (patientIds.length === 0) {
      return [];
    }

    const animalWhere = search
      ? { id: In(patientIds), name: ILike(`%${search}%`) }
      : { id: In(patientIds) };
    const animals = await this.animalRepository.find({ where: animalWhere });

    const discounts = await this.discountRepository.find({
      where: { doctorId, patientId: In(patientIds) },
    });
    const discountByPatientId = new Map(discounts.map((d) => [d.patientId, d]));

    const ownerIds = [
      ...new Set(animals.map((a) => a.userId).filter(Boolean)),
    ] as number[];
    const owners = await Promise.all(
      ownerIds.map((id) => this.usersService.findById(id)),
    );
    const ownersById = new Map(
      owners
        .filter((o): o is NonNullable<typeof o> => !!o)
        .map((o) => [o.id, o]),
    );

    let patients: DoctorPatient[] = animals.map((animal) => ({
      ...animal,
      ownerName: animal.userId
        ? ownersById.get(animal.userId)?.name
        : undefined,
      ownerAvatar: animal.userId
        ? ownersById.get(animal.userId)?.avatar
        : undefined,
      discount: discountByPatientId.get(animal.id),
    }));

    if (discountGiven !== undefined) {
      patients = patients.filter((p) => !!p.discount === discountGiven);
    }

    return patients;
  }

  async getDiscount(
    doctorId: number,
    patientId: number,
  ): Promise<PatientDiscount | null> {
    return this.discountRepository.findOneBy({ doctorId, patientId });
  }

  async applyDiscount(
    doctorId: number,
    patientId: number,
    percent: number,
  ): Promise<PatientDiscount> {
    const existing = await this.discountRepository.findOneBy({
      doctorId,
      patientId,
    });
    if (existing) {
      throw new ConflictException(
        'A discount already exists for this patient — use the edit endpoint',
      );
    }
    return this.discountRepository.save(
      this.discountRepository.create({ doctorId, patientId, percent }),
    );
  }

  async editDiscount(
    id: number,
    doctorId: number,
    percent: number,
  ): Promise<PatientDiscount> {
    const discount = await this.getOwnedDiscount(id, doctorId);
    discount.percent = percent;
    return this.discountRepository.save(discount);
  }

  async removeDiscount(id: number, doctorId: number): Promise<void> {
    const discount = await this.getOwnedDiscount(id, doctorId);
    await this.discountRepository.remove(discount);
  }

  private async getOwnedDiscount(
    id: number,
    doctorId: number,
  ): Promise<PatientDiscount> {
    const discount = await this.discountRepository.findOneBy({ id, doctorId });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    return discount;
  }

  // --- Promo Code Methods ---

  async createDiscount(dto: {
    code: string;
    percent: number;
    validFrom?: string;
    validTo?: string;
    usageLimit?: number;
    isActive?: boolean;
  }): Promise<Discount> {
    const existing = await this.promoDiscountRepository.findOneBy({
      code: dto.code,
    });
    if (existing) {
      throw new ConflictException('Discount code already exists');
    }

    return this.promoDiscountRepository.save(
      this.promoDiscountRepository.create({
        code: dto.code.toUpperCase(),
        percent: dto.percent,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        usageLimit: dto.usageLimit,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async updateDiscount(
    id: number,
    dto: Partial<{
      code: string;
      percent: number;
      validFrom: string;
      validTo: string;
      usageLimit: number;
      isActive: boolean;
    }>,
  ): Promise<Discount> {
    const discount = await this.promoDiscountRepository.findOneBy({ id });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    if (dto.code !== undefined) discount.code = dto.code.toUpperCase();
    if (dto.percent !== undefined) discount.percent = dto.percent;
    if (dto.validFrom !== undefined)
      discount.validFrom = new Date(dto.validFrom);
    if (dto.validTo !== undefined) discount.validTo = new Date(dto.validTo);
    if (dto.usageLimit !== undefined) discount.usageLimit = dto.usageLimit;
    if (dto.isActive !== undefined) discount.isActive = dto.isActive;

    return this.promoDiscountRepository.save(discount);
  }

  async deleteDiscount(id: number): Promise<void> {
    const discount = await this.promoDiscountRepository.findOneBy({ id });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    await this.promoDiscountRepository.remove(discount);
  }

  async getAvailableDiscounts(): Promise<Discount[]> {
    const now = new Date();
    return this.promoDiscountRepository.find({
      where: {
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async validateDiscountCode(code: string): Promise<Discount> {
    const discount = await this.promoDiscountRepository.findOneBy({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }

    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      throw new BadRequestException('Discount code is not yet valid');
    }
    if (discount.validTo && now > discount.validTo) {
      throw new BadRequestException('Discount code has expired');
    }
    if (
      discount.usageLimit !== null &&
      discount.usageLimit !== undefined &&
      discount.usageCount >= discount.usageLimit
    ) {
      throw new BadRequestException('Discount code usage limit reached');
    }

    return discount;
  }

  async applyDiscountCode(
    userId: number,
    code: string,
    appointmentId: number,
  ): Promise<{ success: boolean; discountPercent: number }> {
    const discount = await this.validateDiscountCode(code);

    const appointment = await this.appointmentRepository.findOneBy({
      id: appointmentId,
      patientId: userId,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Increment usage count
    discount.usageCount += 1;
    await this.promoDiscountRepository.save(discount);

    return {
      success: true,
      discountPercent: discount.percent,
    };
  }

  async getUserDiscountHistory(userId: number): Promise<Discount[]> {
    // For now, return all discounts the user has used
    // This could be enhanced with a usage tracking table
    return this.promoDiscountRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
