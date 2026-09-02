import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './appointment.entity';
import { Animal } from '../animals/animal.entity';
import { MedicalEvent, MedicalEventType, MedicalEventStatus } from '../medical-events/medical-event.entity';
import { DoctorsModule } from '../doctors/doctors.module';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { WalletModule } from '../wallet/wallet.module';
import { TimeOffModule } from '../time-off/time-off.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Animal, MedicalEvent]),
    DoctorsModule,
    ChatModule,
    UsersModule,
    ServicesModule,
    NotificationsModule,
    DiscountsModule,
    WalletModule,
    TimeOffModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
