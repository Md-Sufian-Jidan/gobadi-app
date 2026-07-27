import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { AlertsModule } from '../alerts/alerts.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [AnimalsModule, MarketplaceModule, DoctorsModule, AlertsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
