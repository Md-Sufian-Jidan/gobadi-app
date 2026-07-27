import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { DoctorsService, Doctor } from '../doctors/doctors.service';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Service } from '../services/service.entity';
import {
  addMinutes,
  parseSlotDateTime,
  subMinutes,
} from './utils/slot-time.util';

const RESCHEDULE_CANCEL_BUFFER_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface AppointmentWithPatient extends Appointment {
  patientName?: string;
  patientPhone?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
  ) {}

  async bookAppointment(
    doctorId: number,
    patientId: number,
    date: string,
    time: string,
    clinicId?: number,
    serviceId?: number,
  ): Promise<Appointment> {
    const startAt = parseSlotDateTime(date, time);
    return this.assertNoConflictAndBook(doctorId, patientId, startAt, { clinicId, serviceId });
  }

  async listAvailableSlots(
    doctorId: number,
    dateStr: string,
  ): Promise<string[]> {
    const availability = await this.doctorsService.getAvailability(doctorId);
    const targetDate = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = targetDate.getDay();
    const windows = availability.filter(
      (w) => w.isActive && w.dayOfWeek === dayOfWeek,
    );
    if (windows.length === 0) {
      return [];
    }

    const existing = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctorId = :doctorId', { doctorId })
      .andWhere("a.status != 'CANCELLED'")
      .andWhere('a.startAt >= :dayStart AND a.startAt < :dayEnd', {
        dayStart: targetDate,
        dayEnd: addMinutes(targetDate, 24 * 60),
      })
      .getMany();

    const slots: string[] = [];
    for (const window of windows) {
      const [startH, startM] = window.startTime.split(':').map(Number);
      const [endH, endM] = window.endTime.split(':').map(Number);
      let cursor = new Date(targetDate);
      cursor.setHours(startH, startM, 0, 0);
      const windowEnd = new Date(targetDate);
      windowEnd.setHours(endH, endM, 0, 0);

      while (addMinutes(cursor, window.slotDurationMinutes) <= windowEnd) {
        const slotStart = new Date(cursor);
        const slotEnd = addMinutes(slotStart, window.slotDurationMinutes);
        const bufStart = subMinutes(slotStart, window.bufferMinutes);
        const bufEnd = addMinutes(slotEnd, window.bufferMinutes);

        const overlaps = existing.some(
          (a) => a.startAt < bufEnd && a.endAt > bufStart,
        );
        if (!overlaps) {
          slots.push(
            slotStart.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          );
        }
        cursor = slotEnd;
      }
    }
    return slots;
  }

  async listForUser(
    userId: number,
    role: UserRole,
    status?: AppointmentStatus,
  ): Promise<AppointmentWithPatient[]> {
    const where: any = {};
    if (role === UserRole.USER || (role as string) === 'patient') {
      where.patientId = userId;
    } else {
      const doctor = await this.doctorsService.getDoctorByUserId(userId);
      if (!doctor) {
        return [];
      }
      where.doctorId = doctor.id;
    }
    if (status) {
      where.status = status;
    }
    const appointments = await this.appointmentRepository.find({
      where,
      order: { startAt: 'DESC' },
    });

    if (role !== UserRole.DOCTOR || appointments.length === 0) {
      return appointments;
    }

    const distinctPatientIds = [
      ...new Set(appointments.map((a) => a.patientId)),
    ];
    const patients = await Promise.all(
      distinctPatientIds.map((id) => this.usersService.findById(id)),
    );
    const patientsById = new Map(
      patients
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => [p.id, p]),
    );

    return appointments.map((appointment) => ({
      ...appointment,
      patientName: patientsById.get(appointment.patientId)?.name,
      patientPhone: patientsById.get(appointment.patientId)?.phone,
    }));
  }

  async rescheduleAppointment(
    appointmentId: number,
    requesterId: number,
    requesterRole: UserRole,
    date: string,
    time: string,
  ): Promise<Appointment> {
    const appointment = await this.getOwnedAppointment(
      appointmentId,
      requesterId,
      requesterRole,
    );
    this.enforceReschedulableBuffer(appointment);

    const newStartAt = parseSlotDateTime(date, time);
    const rebooked = await this.assertNoConflictAndBook(
      appointment.doctorId,
      appointment.patientId,
      newStartAt,
      {
        excludeAppointmentId: appointment.id,
      },
    );

    await this.appointmentRepository.update(appointment.id, {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledByUserId: requesterId,
    });

    await this.appointmentRepository.update(rebooked.id, {
      status: AppointmentStatus.RESCHEDULED,
      originalStartAt: appointment.startAt,
      rescheduledAt: new Date(),
    });

    return this.appointmentRepository.findOneByOrFail({ id: rebooked.id });
  }

  async cancelAppointment(
    appointmentId: number,
    requesterId: number,
    requesterRole: UserRole,
  ): Promise<Appointment> {
    const appointment = await this.getOwnedAppointment(
      appointmentId,
      requesterId,
      requesterRole,
    );
    this.enforceReschedulableBuffer(appointment);

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = new Date();
    appointment.cancelledByUserId = requesterId;
    return this.appointmentRepository.save(appointment);
  }

  async completeAppointment(
    appointmentId: number,
    doctorUserId: number,
  ): Promise<Appointment> {
    const doctor = await this.doctorsService.getDoctorByUserId(doctorUserId);
    if (!doctor) {
      throw new ForbiddenException('No doctor profile linked to this account');
    }
    const appointment = await this.appointmentRepository.findOneBy({
      id: appointmentId,
    });
    if (!appointment || appointment.doctorId !== doctor.id) {
      throw new NotFoundException('Appointment not found');
    }
    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentRepository.save(appointment);
  }

  private async getOwnedAppointment(
    appointmentId: number,
    requesterId: number,
    requesterRole: UserRole,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({
      id: appointmentId,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (requesterRole === UserRole.USER || (requesterRole as string) === 'patient') {
      if (appointment.patientId !== requesterId) {
        throw new ForbiddenException(
          'You may only manage your own appointments',
        );
      }
    } else {
      const doctor = await this.doctorsService.getDoctorByUserId(requesterId);
      if (!doctor || appointment.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'You may only manage your own appointments',
        );
      }
    }
    return appointment;
  }

  private enforceReschedulableBuffer(appointment: Appointment): void {
    if (
      appointment.startAt.getTime() - Date.now() <
      RESCHEDULE_CANCEL_BUFFER_MS
    ) {
      throw new BadRequestException(
        'Appointments can only be rescheduled or cancelled at least 2 hours in advance',
      );
    }
  }

  private async assertNoConflictAndBook(
    doctorId: number,
    patientId: number,
    startAt: Date,
    opts?: { excludeAppointmentId?: number; clinicId?: number; serviceId?: number },
  ): Promise<Appointment> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the doctor row to serialize all concurrent booking attempts for this doctor.
      await manager
        .getRepository(Doctor)
        .createQueryBuilder('d')
        .setLock('pessimistic_write')
        .where('d.id = :doctorId', { doctorId })
        .getOne();

      const window = await this.doctorsService.findAvailabilityWindow(
        doctorId,
        startAt,
      );
      if (!window) {
        throw new BadRequestException('Doctor is not available at this time');
      }

      const endAt = addMinutes(startAt, window.slotDurationMinutes);
      const bufStart = subMinutes(startAt, window.bufferMinutes);
      const bufEnd = addMinutes(endAt, window.bufferMinutes);

      const conflictQuery = manager
        .getRepository(Appointment)
        .createQueryBuilder('a')
        .where('a.doctorId = :doctorId', { doctorId })
        .andWhere("a.status != 'CANCELLED'")
        .andWhere('a.startAt < :bufEnd AND a.endAt > :bufStart', {
          bufEnd,
          bufStart,
        });
      if (opts?.excludeAppointmentId) {
        conflictQuery.andWhere('a.id != :excludeId', {
          excludeId: opts.excludeAppointmentId,
        });
      }
      const conflicts = await conflictQuery.getMany();
      if (conflicts.length > 0) {
        throw new ConflictException('This time slot is no longer available');
      }

      let price = 0;
      if (opts?.serviceId) {
        const service = await manager.getRepository(Service).findOneBy({ id: opts.serviceId });
        if (service) {
          price = service.price;
        }
      } else {
        const doctor = await manager.getRepository(Doctor).findOneBy({ id: doctorId });
        if (doctor) {
          price = doctor.consultationFee;
        }
      }

      try {
        const created = manager.getRepository(Appointment).create({
          doctorId,
          patientId,
          startAt,
          endAt,
          durationMinutes: window.slotDurationMinutes,
          status: AppointmentStatus.CONFIRMED,
          clinicId: opts?.clinicId || null,
          serviceId: opts?.serviceId || null,
          price,
          paymentStatus: 'pending',
        });
        return await manager.getRepository(Appointment).save(created);
      } catch (e: any) {
        if (e.code === '23505') {
          throw new ConflictException(
            'This time slot was just booked by someone else',
          );
        }
        throw e;
      }
    });
  }
}
