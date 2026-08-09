import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { Doctor } from '../doctors/doctor.entity';
import { RedisService } from '../redis/redis.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { PaginatedResult } from '../common/paginated-result.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

const CLINICS_INDEX = 'clinics';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly redisService: RedisService,
    private readonly meilisearchService: MeilisearchService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getItemCacheKey(id: number): string {
    return `cache:clinics:profile:${id}`;
  }

  async create(userId: number, dto: CreateClinicDto): Promise<Clinic> {
    const clinic = this.clinicRepository.create({
      ...dto,
      userId,
      isVerified: false,
      doctors: [],
    });
    const saved = await this.clinicRepository.save(clinic);

    // Sync to search
    await this.meilisearchService.indexDocument(CLINICS_INDEX, {
      id: saved.id,
      name: saved.name,
      location: saved.location,
      rating: saved.rating,
      isVerified: saved.isVerified,
    });

    return saved;
  }

  async findAll(page?: number, limit?: number): Promise<Clinic[] | PaginatedResult<Clinic>> {
    const where = {};
    if (!page && !limit) {
      return this.clinicRepository.find({
        relations: { doctors: true },
        order: { name: 'ASC' },
      });
    }

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;

    const [data, total] = await this.clinicRepository.findAndCount({
      where,
      relations: { doctors: true },
      order: { name: 'ASC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return { data, page: currentPage, limit: pageSize, total };
  }

  async findOne(id: number): Promise<Clinic> {
    const cacheKey = this.getItemCacheKey(id);
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to read clinic cache', err);
    }

    const clinic = await this.clinicRepository.findOne({
      where: { id },
      relations: { doctors: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(clinic), 3600); // 1 hour
    } catch (err) {
      console.warn('Failed to write clinic cache', err);
    }

    return clinic;
  }

  async update(id: number, userId: number, role: string, dto: Partial<CreateClinicDto>): Promise<Clinic> {
    const clinic = await this.findOne(id);
    if (clinic.userId !== userId && role !== 'admin') {
      throw new ForbiddenException('You do not own this clinic profile');
    }

    Object.assign(clinic, dto);
    const updated = await this.clinicRepository.save(clinic);

    // Invalidate cache
    await this.redisService.del(this.getItemCacheKey(id));

    // Sync to search
    await this.meilisearchService.indexDocument(CLINICS_INDEX, {
      id: updated.id,
      name: updated.name,
      location: updated.location,
      rating: updated.rating,
      isVerified: updated.isVerified,
    });

    return updated;
  }

  async verifyClinic(id: number, isVerified: boolean): Promise<Clinic> {
    const clinic = await this.findOne(id);
    clinic.isVerified = isVerified;
    const updated = await this.clinicRepository.save(clinic);

    // Invalidate cache
    await this.redisService.del(this.getItemCacheKey(id));

    // Sync to search
    await this.meilisearchService.indexDocument(CLINICS_INDEX, {
      id: updated.id,
      name: updated.name,
      location: updated.location,
      rating: updated.rating,
      isVerified: updated.isVerified,
    });

    await this.notificationsService.createNotification(
      updated.userId,
      updated.isVerified ? 'Clinic verified' : 'Clinic verification rejected',
      updated.isVerified
        ? 'Your clinic has been verified.'
        : 'Your clinic verification was rejected.',
      NotificationType.SYSTEM,
      'Clinic',
      String(updated.id),
    );

    return updated;
  }

  async addDoctor(id: number, doctorId: number, userId: number, role: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({ where: { id }, relations: { doctors: true } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    if (clinic.userId !== userId && role !== 'admin') {
      throw new ForbiddenException('You do not own this clinic profile');
    }

    const doctor = await this.doctorRepository.findOneBy({ id: doctorId });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (clinic.doctors.some((d) => d.id === doctorId)) {
      return clinic;
    }

    clinic.doctors.push(doctor);
    const saved = await this.clinicRepository.save(clinic);

    await this.redisService.del(this.getItemCacheKey(id));
    return saved;
  }

  async removeDoctor(id: number, doctorId: number, userId: number, role: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({ where: { id }, relations: { doctors: true } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    if (clinic.userId !== userId && role !== 'admin') {
      throw new ForbiddenException('You do not own this clinic profile');
    }

    clinic.doctors = clinic.doctors.filter((d) => d.id !== doctorId);
    const saved = await this.clinicRepository.save(clinic);

    await this.redisService.del(this.getItemCacheKey(id));
    return saved;
  }
}
