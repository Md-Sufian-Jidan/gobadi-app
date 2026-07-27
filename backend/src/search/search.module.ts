import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalsModule } from '../animals/animals.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { AlertsModule } from '../alerts/alerts.module';
import { Animal } from '../animals/animal.entity';
import { MarketItem } from '../marketplace/market-item.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Alert } from '../alerts/alert.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchIndexBootstrap } from './search-index.bootstrap';

@Module({
  imports: [
    AnimalsModule,
    MarketplaceModule,
    DoctorsModule,
    AlertsModule,
    TypeOrmModule.forFeature([Animal, MarketItem, Doctor, Alert]),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchIndexBootstrap],
})
export class SearchModule {}
