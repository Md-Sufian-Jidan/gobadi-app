import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRate } from './market-rate.entity';
import { MarketRatesService } from './market-rates.service';
import { MarketRatesController } from './market-rates.controller';
import { AdminMarketRatesController } from './admin-market-rates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MarketRate])],
  controllers: [MarketRatesController, AdminMarketRatesController],
  providers: [MarketRatesService],
  exports: [MarketRatesService],
})
export class MarketRatesModule {}
