import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { FileProcessingProcessor } from './file-processing.processor';
import { Attachment } from './attachment.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    BullModule.registerQueue({ name: 'file-processing-queue' }),
    MulterModule.register({ limits: { fileSize: 20 * 1024 * 1024 } }),
    CloudinaryModule,
    ChatModule,
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, FileProcessingProcessor],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
