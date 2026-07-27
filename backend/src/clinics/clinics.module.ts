import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { Doctor } from '../doctors/doctor.entity';
import { RedisModule } from '../redis/redis.module';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clinic, Doctor]),
    RedisModule,
    MeilisearchModule,
  ],
  providers: [ClinicsService],
  controllers: [ClinicsController],
  exports: [ClinicsService, TypeOrmModule],
})
export class ClinicsModule {}
