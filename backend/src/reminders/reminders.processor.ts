import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bullmq';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from '../appointments/appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { User } from '../users/user.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

interface ReminderWindow {
  label: '24h' | '1h';
  flagColumn: 'reminder24hSent' | 'reminder1hSent';
  fromMs: number;
  toMs: number;
}

const WINDOWS: ReminderWindow[] = [
  {
    label: '24h',
    flagColumn: 'reminder24hSent',
    fromMs: 23.5 * 60 * 60 * 1000,
    toMs: 24.5 * 60 * 60 * 1000,
  },
  {
    label: '1h',
    flagColumn: 'reminder1hSent',
    fromMs: 0.75 * 60 * 60 * 1000,
    toMs: 1.25 * 60 * 60 * 1000,
  },
];

@Processor('reminders-queue')
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'scan-appointments') {
      return;
    }

    for (const window of WINDOWS) {
      await this.scanWindow(window);
    }
  }

  private async scanWindow(window: ReminderWindow): Promise<void> {
    const now = Date.now();
    const from = new Date(now + window.fromMs);
    const to = new Date(now + window.toMs);

    // Atomic UPDATE...RETURNING is what prevents duplicate sends across overlapping scan ticks,
    // not just the once-per-tick guarantee of the repeatable job itself.
    const result = await this.appointmentRepository
      .createQueryBuilder()
      .update(Appointment)
      .set({ [window.flagColumn]: true })
      .where('status = :status', { status: AppointmentStatus.CONFIRMED })
      .andWhere(`"${window.flagColumn}" = false`)
      .andWhere('"startAt" BETWEEN :from AND :to', { from, to })
      .returning('*')
      .execute();

    const dueAppointments: Appointment[] = result.raw;
    for (const appointment of dueAppointments) {
      await this.dispatchReminder(appointment, window.label);
    }

    if (dueAppointments.length > 0) {
      this.logger.log(
        `Dispatched ${dueAppointments.length} ${window.label} reminder(s)`,
      );
    }
  }

  private async dispatchReminder(
    appointment: Appointment,
    windowLabel: '24h' | '1h',
  ): Promise<void> {
    const [patient, doctor] = await Promise.all([
      this.userRepository.findOneBy({ id: appointment.patientId }),
      this.doctorRepository.findOneBy({ id: appointment.doctorId }),
    ]);

    if (patient?.email) {
      try {
        await this.mailQueue.add('send-appointment-reminder', {
          email: patient.email,
          doctorName: doctor?.name || 'your doctor',
          date: appointment.startAt.toDateString(),
          time: appointment.startAt.toLocaleTimeString(),
          windowLabel,
        });
      } catch (err) {
        this.logger.warn('Failed to queue appointment reminder email', err);
      }
    }

    this.chatGateway.notifyUser(appointment.patientId, 'appointmentReminder', {
      appointmentId: appointment.id,
      startAt: appointment.startAt,
      windowLabel,
    });
    await this.notificationsService.createNotification(
      appointment.patientId,
      'Appointment reminder',
      `Your appointment with ${doctor?.name || 'your doctor'} is in ${windowLabel}.`,
      NotificationType.REMINDER,
      'Appointment',
      String(appointment.id),
    );

    if (doctor?.userId) {
      this.chatGateway.notifyUser(doctor.userId, 'appointmentReminder', {
        appointmentId: appointment.id,
        startAt: appointment.startAt,
        windowLabel,
      });
      await this.notificationsService.createNotification(
        doctor.userId,
        'Appointment reminder',
        `Your appointment with ${patient?.name || 'your patient'} is in ${windowLabel}.`,
        NotificationType.REMINDER,
        'Appointment',
        String(appointment.id),
      );
    }
  }
}
