import { Injectable } from '@nestjs/common';
import { AnimalsService, Animal } from '../animals/animals.service';
import {
  MarketplaceService,
  MarketItem,
} from '../marketplace/marketplace.service';
import { DoctorsService, Doctor } from '../doctors/doctors.service';
import { AlertsService, Alert } from '../alerts/alerts.service';

export interface SearchResults {
  animals: Animal[];
  marketplace: MarketItem[];
  doctors: Doctor[];
  alerts: Alert[];
}

export type SearchType = 'animals' | 'marketplace' | 'doctors' | 'alerts';

@Injectable()
export class SearchService {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly marketplaceService: MarketplaceService,
    private readonly doctorsService: DoctorsService,
    private readonly alertsService: AlertsService,
  ) {}

  async search(
    userId: number,
    q: string,
    type?: SearchType,
    filters?: { category?: string; specialty?: string },
  ): Promise<Partial<SearchResults>> {
    if (!q) {
      return { animals: [], marketplace: [], doctors: [], alerts: [] };
    }

    const wantsAll = !type;
    const [animals, marketplace, doctors, alerts] = await Promise.all([
      wantsAll || type === 'animals'
        ? this.animalsService.search(userId, q)
        : Promise.resolve(undefined),
      wantsAll || type === 'marketplace'
        ? this.marketplaceService.search(q, filters?.category)
        : Promise.resolve(undefined),
      wantsAll || type === 'doctors'
        ? this.doctorsService.search(q, filters?.specialty)
        : Promise.resolve(undefined),
      wantsAll || type === 'alerts'
        ? this.alertsService.search(q)
        : Promise.resolve(undefined),
    ]);

    const results: Partial<SearchResults> = {};
    if (animals !== undefined) results.animals = animals;
    if (marketplace !== undefined) results.marketplace = marketplace;
    if (doctors !== undefined) results.doctors = doctors;
    if (alerts !== undefined) results.alerts = alerts;
    return results;
  }
}
