import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { Product } from '../products/product.entity';
import { Livestock } from '../livestock/livestock.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';

@Injectable()
export class SearchService {
  constructor(
    private readonly meilisearchService: MeilisearchService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async globalSearch(query: string) {
    if (!query) {
      return { products: [], livestock: [], doctors: [], clinics: [] };
    }

    if (this.meilisearchService.isEnabled) {
      try {
        const [products, livestock, doctors, clinics] = await Promise.all([
          this.meilisearchService.search<any>('products', query, { limit: 10 }),
          this.meilisearchService.search<any>('livestock', query, { limit: 10 }),
          this.meilisearchService.search<any>('doctors', query, { limit: 10 }),
          this.meilisearchService.search<any>('clinics', query, { limit: 10 }),
        ]);

        if (products !== null && livestock !== null && doctors !== null && clinics !== null) {
          return { products, livestock, doctors, clinics };
        }
      } catch (err) {
        console.warn('Meilisearch global query failed, falling back to database', err);
      }
    }

    const [products, livestock, doctors, clinics] = await Promise.all([
      this.productRepository.find({
        where: [
          { name: ILike(`%${query}%`) },
          { description: ILike(`%${query}%`) },
        ],
        take: 10,
      }),
      this.livestockRepository.find({
        where: [
          { breed: ILike(`%${query}%`) },
          { species: ILike(`%${query}%`) },
        ],
        take: 10,
      }),
      this.doctorRepository.find({
        where: [
          { name: ILike(`%${query}%`) },
          { specialty: ILike(`%${query}%`) },
          { bio: ILike(`%${query}%`) },
        ],
        take: 10,
      }),
      this.clinicRepository.find({
        where: [
          { name: ILike(`%${query}%`) },
          { location: ILike(`%${query}%`) },
          { description: ILike(`%${query}%`) },
        ],
        take: 10,
      }),
    ]);

    return { products, livestock, doctors, clinics };
  }
}
