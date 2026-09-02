import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalEvent } from './medical-event.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Animal } from '../animals/animal.entity';
import { MedicalEventsService } from './medical-events.service';
import { MedicalEventsController } from './medical-events.controller';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalEvent, Appointment, Animal]),
    DoctorsModule,
  ],
  controllers: [MedicalEventsController],
  providers: [MedicalEventsService],
  exports: [MedicalEventsService],
})
export class MedicalEventsModule {}
