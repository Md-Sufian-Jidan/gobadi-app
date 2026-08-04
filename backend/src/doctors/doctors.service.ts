import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Availability } from './availability.entity';
import { PaginatedResult } from '../common/paginated-result.interface';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
export { Doctor } from './doctor.entity';
export { Availability } from './availability.entity';

const DOCTORS_INDEX = 'doctors';

export interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  bufferMinutes?: number;
}

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async getDoctors(
    page?: number,
    limit?: number,
    specialty?: string,
  ): Promise<Doctor[] | PaginatedResult<Doctor>> {
    const where = specialty ? { specialty: ILike(`%${specialty}%`) } : {};
    if (!page && !limit) {
      return this.doctorRepository.find({ where, order: { id: 'ASC' } });
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const [data, total] = await this.doctorRepository.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { data, page: currentPage, limit: pageSize, total };
  }

  async search(q: string, specialty?: string): Promise<Doctor[]> {
    if (!q) {
      return [];
    }
    const hits = await this.meilisearchService.search<Doctor>(
      DOCTORS_INDEX,
      q,
      {
        limit: 10,
        filter: specialty ? `specialty = "${specialty}"` : undefined,
      },
    );
    if (hits !== null) {
      return hits;
    }
    return this.doctorRepository.find({
      where: [{ name: ILike(`%${q}%`) }, { specialty: ILike(`%${q}%`) }],
      take: 10,
    });
  }

  async getDoctorById(id: string | number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOneBy({
      id: typeof id === 'string' ? parseInt(id, 10) : id,
    });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }
    return doctor;
  }

  async getDoctorByUserId(userId: number): Promise<Doctor | null> {
    return this.doctorRepository.findOneBy({ userId });
  }

  /**
   * Creates the minimal, unverified profile row a self-registered doctor
   * needs so doctor-only endpoints (e.g. GET /doctors/me) resolve. The
   * doctor fills in specialty/experience/bio/etc. later; isVerified stays
   * false until an admin reviews the account.
   */
  async createProfileForUser(user: {
    id: number;
    name?: string;
  }): Promise<Doctor> {
    const existing = await this.getDoctorByUserId(user.id);
    if (existing) {
      return existing;
    }
    const doctor = this.doctorRepository.create({
      userId: user.id,
      name: user.name ?? 'New Doctor',
      specialty: 'General',
      experience: '0 Years',
      avatar: '',
      bio: '',
      isVerified: false,
    });
    return this.doctorRepository.save(doctor);
  }

  async getAvailability(doctorId: string | number): Promise<Availability[]> {
    const id = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
    return this.availabilityRepository.find({
      where: { doctorId: id },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async setAvailability(
    doctorId: number,
    entries: AvailabilityEntry[],
  ): Promise<Availability[]> {
    await this.availabilityRepository.delete({ doctorId });
    const created = entries.map((entry) =>
      this.availabilityRepository.create({
        doctorId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        slotDurationMinutes: entry.slotDurationMinutes ?? 30,
        bufferMinutes: entry.bufferMinutes ?? 10,
      }),
    );
    return this.availabilityRepository.save(created);
  }

  /** Finds the active availability window covering the time-of-day of `at` for the doctor's day-of-week. */
  async findAvailabilityWindow(
    doctorId: number,
    at: Date,
  ): Promise<Availability | null> {
    const dayOfWeek = at.getDay();
    const windows = await this.availabilityRepository.find({
      where: { doctorId, dayOfWeek, isActive: true },
    });

    const minutesOfDay = at.getHours() * 60 + at.getMinutes();
    for (const window of windows) {
      const [startH, startM] = window.startTime.split(':').map(Number);
      const [endH, endM] = window.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (minutesOfDay >= startMinutes && minutesOfDay < endMinutes) {
        return window;
      }
    }
    return null;
  }
}
