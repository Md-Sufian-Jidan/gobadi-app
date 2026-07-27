import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Product } from '../products/product.entity';
import { Livestock } from '../livestock/livestock.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';
import { SearchIndexBootstrap } from './search-index.bootstrap';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Livestock, Doctor, Clinic]),
    MeilisearchModule,
  ],
  providers: [SearchService, SearchIndexBootstrap],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
