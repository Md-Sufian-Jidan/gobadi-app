import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiDiagnosis } from './ai-diagnosis.entity';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AiDiagnosisController } from './ai-diagnosis.controller';
import { Doctor } from '../doctors/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiDiagnosis, Doctor])],
  providers: [AiDiagnosisService],
  controllers: [AiDiagnosisController],
  exports: [AiDiagnosisService, TypeOrmModule],
})
export class AiDiagnosisModule {}
