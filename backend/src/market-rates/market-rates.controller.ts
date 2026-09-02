import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketRatesService } from './market-rates.service';
import { MarketRate } from './market-rate.entity';

@ApiTags('market-rates')
@Controller('market-rates')
export class MarketRatesController {
  constructor(private readonly marketRatesService: MarketRatesService) {}

  @Get()
  @ApiOperation({ summary: "Get today's/latest rates for all commodities" })
  async getLatestRates(): Promise<MarketRate[]> {
    return this.marketRatesService.getLatestRates();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get historical rates for a commodity' })
  @ApiQuery({ name: 'commodity', required: false })
  async getHistory(
    @Query('commodity') commodity?: string,
  ): Promise<MarketRate[]> {
    return this.marketRatesService.getHistory(commodity);
  }
}
