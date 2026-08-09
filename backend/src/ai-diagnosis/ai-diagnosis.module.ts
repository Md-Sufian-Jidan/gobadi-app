import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiDiagnosis } from './ai-diagnosis.entity';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AiDiagnosisController } from './ai-diagnosis.controller';
import { Doctor } from '../doctors/doctor.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiDiagnosis, Doctor]), NotificationsModule],
  providers: [AiDiagnosisService],
  controllers: [AiDiagnosisController],
  exports: [AiDiagnosisService, TypeOrmModule],
})
export class AiDiagnosisModule {}
