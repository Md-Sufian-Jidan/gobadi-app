import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientDiscount } from './patient-discount.entity';
import { Discount } from './discount.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Animal } from '../animals/animal.entity';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { AdminDiscountsController } from './admin-discounts.controller';
import { UserDiscountsController } from './user-discounts.controller';
import { DoctorsModule } from '../doctors/doctors.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientDiscount, Discount, Appointment, Animal]),
    DoctorsModule,
    UsersModule,
  ],
  controllers: [
    DiscountsController,
    AdminDiscountsController,
    UserDiscountsController,
  ],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
