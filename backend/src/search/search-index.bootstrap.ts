import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from '../animals/animal.entity';
import { MarketItem } from '../marketplace/market-item.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Alert } from '../alerts/alert.entity';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

/** One-time sync of existing rows into Meilisearch on boot, so pre-existing data is searchable
 * without a separate reindex command. Ongoing changes are kept in sync by each entity's own
 * service (see indexDocument/deleteDocument calls in animals/marketplace/doctors/alerts services). */
@Injectable()
export class SearchIndexBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexBootstrap.name);

  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    @InjectRepository(MarketItem)
    private readonly marketItemRepository: Repository<MarketItem>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.meilisearchService.isEnabled) {
      return;
    }
    try {
      const [animals, marketItems, doctors, alerts] = await Promise.all([
        this.animalRepository.find(),
        this.marketItemRepository.find(),
        this.doctorRepository.find(),
        this.alertRepository.find({ where: { isActive: true } }),
      ]);
      await Promise.all([
        this.meilisearchService.indexDocuments(
          'animals',
          animals.map((a) => ({ ...a })),
        ),
        this.meilisearchService.indexDocuments(
          'marketplace',
          marketItems.map((m) => ({ ...m })),
        ),
        this.meilisearchService.indexDocuments(
          'doctors',
          doctors.map((d) => ({ ...d })),
        ),
        this.meilisearchService.indexDocuments(
          'alerts',
          alerts.map((a) => ({ ...a })),
        ),
      ]);
      this.logger.log('Synced existing rows into Meilisearch indexes');
    } catch (err) {
      this.logger.warn(`Failed to bootstrap Meilisearch indexes: ${err}`);
    }
  }
}
