import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Availability } from './availability.entity';
export { Doctor } from './doctor.entity';
export { Availability } from './availability.entity';

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
  ) {}

  async getDoctors(): Promise<Doctor[]> {
    return this.doctorRepository.find({ order: { id: 'ASC' } });
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
