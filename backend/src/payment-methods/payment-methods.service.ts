import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async list(userId: number): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(
    userId: number,
    dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodRepository.save(
      this.paymentMethodRepository.create({
        userId,
        type: dto.type,
        maskedNumber: dto.maskedNumber,
        provider: dto.provider,
      }),
    );
  }

  async update(
    id: number,
    userId: number,
    data: Partial<Pick<PaymentMethod, 'maskedNumber' | 'provider'>>,
  ): Promise<PaymentMethod> {
    const pm = await this.paymentMethodRepository.findOneBy({ id });
    if (!pm) {
      throw new NotFoundException('Payment method not found');
    }
    if (pm.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (data.maskedNumber !== undefined) pm.maskedNumber = data.maskedNumber;
    if (data.provider !== undefined) pm.provider = data.provider;

    return this.paymentMethodRepository.save(pm);
  }

  async remove(id: number, userId: number): Promise<void> {
    const pm = await this.paymentMethodRepository.findOneBy({ id });
    if (!pm) {
      throw new NotFoundException('Payment method not found');
    }
    if (pm.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.paymentMethodRepository.remove(pm);
  }

  async setDefault(id: number, userId: number): Promise<PaymentMethod> {
    const pm = await this.paymentMethodRepository.findOneBy({ id });
    if (!pm) {
      throw new NotFoundException('Payment method not found');
    }
    if (pm.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Unset all other defaults for this user
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    pm.isDefault = true;
    return this.paymentMethodRepository.save(pm);
  }

  async verifyOtp(
    id: number,
    userId: number,
    otp: string,
  ): Promise<PaymentMethod> {
    const pm = await this.paymentMethodRepository.findOneBy({ id });
    if (!pm) {
      throw new NotFoundException('Payment method not found');
    }
    if (pm.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // For now, accept any OTP (real bKash verification deferred)
    pm.isVerified = true;
    pm.verificationOtp = undefined;
    return this.paymentMethodRepository.save(pm);
  }
}
