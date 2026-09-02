import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { Appointment } from '../appointments/appointment.entity';
import { Task } from '../tasks/task.entity';
import { DoctorTimeOff } from '../time-off/doctor-time-off.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Task, DoctorTimeOff])],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
