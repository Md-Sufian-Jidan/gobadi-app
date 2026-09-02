import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';
import { Task } from '../tasks/task.entity';
import { DoctorTimeOff } from '../time-off/doctor-time-off.entity';

export interface CalendarDay {
  date: string;
  appointments: Appointment[];
  tasks: Task[];
  blockTimes: DoctorTimeOff[];
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(DoctorTimeOff)
    private readonly timeOffRepository: Repository<DoctorTimeOff>,
  ) {}

  async getDoctorMonthlyCalendar(
    doctorId: number,
    month: number,
    year: number,
  ): Promise<CalendarDay[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [appointments, tasks, blockTimes] = await Promise.all([
      this.appointmentRepository.find({
        where: {
          doctorId,
          startAt: MoreThanOrEqual(startDate),
          endAt: LessThanOrEqual(endDate),
        },
        order: { startAt: 'ASC' },
      }),
      this.taskRepository.find({
        where: {
          userId: doctorId,
          dueDate: Between(startDate, endDate),
        },
      }),
      this.timeOffRepository.find({
        where: {
          doctorId,
          startDate: Between(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          ),
        },
      }),
    ]);

    return this.buildCalendarDays(startDate, endDate, appointments, tasks, blockTimes);
  }

  async getDoctorWeeklyCalendar(
    doctorId: number,
    date: string,
  ): Promise<CalendarDay[]> {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59);

    const [appointments, tasks, blockTimes] = await Promise.all([
      this.appointmentRepository.find({
        where: {
          doctorId,
          startAt: MoreThanOrEqual(start),
          endAt: LessThanOrEqual(end),
        },
        order: { startAt: 'ASC' },
      }),
      this.taskRepository.find({
        where: {
          userId: doctorId,
          dueDate: Between(start, end),
        },
      }),
      this.timeOffRepository.find({
        where: {
          doctorId,
          startDate: Between(
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0],
          ),
        },
      }),
    ]);

    return this.buildCalendarDays(start, end, appointments, tasks, blockTimes);
  }

  async getUserAppointments(
    userId: number,
    date: string,
    view: 'day' | 'week' | 'month',
  ): Promise<Appointment[]> {
    const start = new Date(date);
    let end = new Date(date);

    if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59);
    } else if (view === 'month') {
      start.setDate(1);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59);
    }

    return this.appointmentRepository.find({
      where: {
        patientId: userId,
        startAt: MoreThanOrEqual(start),
        endAt: LessThanOrEqual(end),
      },
      order: { startAt: 'ASC' },
    });
  }

  async getBadges(
    doctorId: number,
    month: number,
    year: number,
  ): Promise<Record<string, number>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const appointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        startAt: MoreThanOrEqual(startDate),
        endAt: LessThanOrEqual(endDate),
      },
    });

    const badges: Record<string, number> = {};
    for (const apt of appointments) {
      const dateStr = apt.startAt.toISOString().split('T')[0];
      badges[dateStr] = (badges[dateStr] || 0) + 1;
    }

    return badges;
  }

  private buildCalendarDays(
    start: Date,
    end: Date,
    appointments: Appointment[],
    tasks: Task[],
    blockTimes: DoctorTimeOff[],
  ): CalendarDay[] {
    const days: CalendarDay[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        appointments: appointments.filter(
          (a) => a.startAt.toISOString().split('T')[0] === dateStr,
        ),
        tasks: tasks.filter(
          (t) => t.dueDate && t.dueDate.toISOString().split('T')[0] === dateStr,
        ),
        blockTimes: blockTimes.filter((b) => b.startDate === dateStr),
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }
}
