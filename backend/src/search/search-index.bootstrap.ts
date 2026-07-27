import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Livestock } from '../livestock/livestock.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

@Injectable()
export class SearchIndexBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexBootstrap.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.meilisearchService.isEnabled) {
      return;
    }
    try {
      const [products, livestock, doctors, clinics] = await Promise.all([
        this.productRepository.find(),
        this.livestockRepository.find(),
        this.doctorRepository.find(),
        this.clinicRepository.find(),
      ]);
      await Promise.all([
        this.meilisearchService.indexDocuments(
          'products',
          products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            description: p.description,
          })),
        ),
        this.meilisearchService.indexDocuments(
          'livestock',
          livestock.map((l) => ({
            id: l.id,
            species: l.species,
            breed: l.breed,
            price: l.price,
            location: l.location,
            isSold: l.isSold,
          })),
        ),
        this.meilisearchService.indexDocuments(
          'doctors',
          doctors.map((d) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
            bio: d.bio,
            isVerified: d.isVerified,
          })),
        ),
        this.meilisearchService.indexDocuments(
          'clinics',
          clinics.map((c) => ({
            id: c.id,
            name: c.name,
            location: c.location,
            description: c.description,
            isVerified: c.isVerified,
          })),
        ),
      ]);
      this.logger.log('Synced existing rows into Meilisearch indexes');
    } catch (err) {
      this.logger.warn(`Failed to bootstrap Meilisearch indexes: ${err}`);
    }
  }
}
