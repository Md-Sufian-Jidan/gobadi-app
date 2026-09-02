import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MarketRate } from './market-rate.entity';
import { CreateMarketRateDto } from './dto/create-market-rate.dto';

@Injectable()
export class MarketRatesService {
  constructor(
    @InjectRepository(MarketRate)
    private readonly marketRateRepository: Repository<MarketRate>,
  ) {}

  async getLatestRates(): Promise<MarketRate[]> {
    const rates = await this.marketRateRepository
      .createQueryBuilder('rate')
      .select('rate.commodity', 'commodity')
      .addSelect('MAX(rate.date)', 'latestDate')
      .groupBy('rate.commodity')
      .getRawMany();

    if (rates.length === 0) return [];

    const conditions = rates.map(
      (r) => `(rate.commodity = '${r.commodity}' AND rate.date = '${r.latestDate}')`,
    );

    return this.marketRateRepository
      .createQueryBuilder('rate')
      .where(`(${conditions.join(' OR ')})`)
      .getMany();
  }

  async getHistory(commodity?: string): Promise<MarketRate[]> {
    const where = commodity ? { commodity } : {};
    return this.marketRateRepository.find({
      where,
      order: { date: 'DESC', commodity: 'ASC' },
      take: 100,
    });
  }

  async createOrUpdate(dto: CreateMarketRateDto): Promise<MarketRate> {
    const where: Record<string, unknown> = {
      commodity: dto.commodity,
      date: dto.date,
    };
    if (dto.region) {
      where.region = dto.region;
    } else {
      where.region = IsNull();
    }

    const existing = await this.marketRateRepository.findOne({ where });

    if (existing) {
      existing.price = dto.price;
      existing.unit = dto.unit;
      return this.marketRateRepository.save(existing);
    }

    return this.marketRateRepository.save(
      this.marketRateRepository.create({
        commodity: dto.commodity,
        price: dto.price,
        unit: dto.unit,
        date: dto.date,
        region: dto.region,
      }),
    );
  }
}
