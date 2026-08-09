import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewTargetType } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order, OrderStatus } from '../orders/order.entity';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: number, dto: CreateReviewDto): Promise<Review> {
    let isVerified = false;

    // Check verification status
    if (dto.targetType === ReviewTargetType.PRODUCT) {
      const orders = await this.orderRepository.find({
        where: { userId, status: OrderStatus.COMPLETED },
        relations: { items: true },
      });
      isVerified = orders.some((o) =>
        o.items.some((item) => item.productId === parseInt(dto.targetId, 10)),
      );
    } else if (dto.targetType === ReviewTargetType.DOCTOR) {
      const count = await this.appointmentRepository.count({
        where: {
          patientId: userId,
          doctorId: parseInt(dto.targetId, 10),
          status: AppointmentStatus.COMPLETED,
        },
      });
      isVerified = count > 0;
    } else if (dto.targetType === ReviewTargetType.CLINIC) {
      const count = await this.appointmentRepository.count({
        where: {
          patientId: userId,
          clinicId: parseInt(dto.targetId, 10),
          status: AppointmentStatus.COMPLETED,
        },
      });
      isVerified = count > 0;
    } else if (dto.targetType === ReviewTargetType.SERVICE) {
      const count = await this.appointmentRepository.count({
        where: {
          patientId: userId,
          serviceId: parseInt(dto.targetId, 10),
          status: AppointmentStatus.COMPLETED,
        },
      });
      isVerified = count > 0;
    }

    const review = this.reviewRepository.create({
      ...dto,
      userId,
      isVerified,
      isApproved: true, // Default approved, can be modified via moderation queue
    });

    const saved = await this.reviewRepository.save(review);

    // Recalculate average ratings for doctors and clinics
    if (dto.targetType === ReviewTargetType.DOCTOR) {
      await this.recalculateDoctorRating(parseInt(dto.targetId, 10));
      const doctor = await this.doctorRepository.findOneBy({
        id: parseInt(dto.targetId, 10),
      });
      if (doctor?.userId) {
        await this.notificationsService.createNotification(
          doctor.userId,
          'New review',
          `You received a new ${dto.rating}-star review.`,
          NotificationType.SYSTEM,
          'Doctor',
          dto.targetId,
        );
      }
    } else if (dto.targetType === ReviewTargetType.CLINIC) {
      await this.recalculateClinicRating(parseInt(dto.targetId, 10));
      const clinic = await this.clinicRepository.findOneBy({
        id: parseInt(dto.targetId, 10),
      });
      if (clinic) {
        await this.notificationsService.createNotification(
          clinic.userId,
          'New review',
          `You received a new ${dto.rating}-star review.`,
          NotificationType.SYSTEM,
          'Clinic',
          dto.targetId,
        );
      }
    }

    return saved;
  }

  async findByTarget(targetType: ReviewTargetType, targetId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { targetType, targetId, isApproved: true },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async voteHelpful(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.helpfulCount += 1;
    return this.reviewRepository.save(review);
  }

  async reportReview(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.isReported = true;
    return this.reviewRepository.save(review);
  }

  async getReportedReviews(): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { isReported: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async moderate(id: number, isApproved: boolean): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.isApproved = isApproved;
    review.isReported = false; // Reset reported status once moderated
    const saved = await this.reviewRepository.save(review);

    if (review.targetType === ReviewTargetType.DOCTOR) {
      await this.recalculateDoctorRating(parseInt(review.targetId, 10));
    } else if (review.targetType === ReviewTargetType.CLINIC) {
      await this.recalculateClinicRating(parseInt(review.targetId, 10));
    }

    return saved;
  }

  async reply(id: number, replyText: string): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.reply = replyText;
    return this.reviewRepository.save(review);
  }

  private async recalculateDoctorRating(doctorId: number): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.targetType = :type AND review.targetId = :targetId AND review.isApproved = true', {
        type: ReviewTargetType.DOCTOR,
        targetId: doctorId.toString(),
      })
      .getRawOne();

    const avg = parseFloat(result?.avg || '5.0');
    await this.doctorRepository.update(doctorId, { rating: parseFloat(avg.toFixed(1)) });
  }

  private async recalculateClinicRating(clinicId: number): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.targetType = :type AND review.targetId = :targetId AND review.isApproved = true', {
        type: ReviewTargetType.CLINIC,
        targetId: clinicId.toString(),
      })
      .getRawOne();

    const avg = parseFloat(result?.avg || '5.0');
    await this.clinicRepository.update(clinicId, { rating: parseFloat(avg.toFixed(1)) });
  }
}
