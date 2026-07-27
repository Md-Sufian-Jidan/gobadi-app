import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Livestock, LivestockStatus } from './livestock.entity';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { RedisService } from '../redis/redis.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { PaginatedResult } from '../common/paginated-result.interface';

const LIVESTOCK_INDEX = 'livestock';

@Injectable()
export class LivestockService {
  constructor(
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
    private readonly redisService: RedisService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  private getFeaturedCacheKey(): string {
    return 'cache:livestock:featured';
  }

  private getItemCacheKey(id: number): string {
    return `cache:livestock:item:${id}`;
  }

  private async invalidateCache(id?: number): Promise<void> {
    try {
      await this.redisService.del(this.getFeaturedCacheKey());
      if (id) {
        await this.redisService.del(this.getItemCacheKey(id));
      }
    } catch (err) {
      console.warn('Failed to invalidate livestock cache', err);
    }
  }

  async create(sellerId: number, dto: CreateLivestockDto): Promise<Livestock> {
    const listing = this.livestockRepository.create({
      ...dto,
      sellerId,
      isVerified: false,
      isReserved: false,
      isSold: false,
    });
    const saved = await this.livestockRepository.save(listing);

    await this.invalidateCache();
    await this.syncToSearch(saved);

    return saved;
  }

  async findAll(
    page?: number,
    limit?: number,
    species?: string,
    breed?: string,
  ): Promise<Livestock[] | PaginatedResult<Livestock>> {
    const where: any = {
      status: LivestockStatus.PUBLISHED,
      isSold: false,
      isReserved: false,
    };
    if (species) where.species = ILike(species);
    if (breed) where.breed = ILike(breed);

    if (!page && !limit) {
      return this.livestockRepository.find({
        where,
        relations: { seller: true },
        order: { isFeatured: 'DESC', createdAt: 'DESC' },
      });
    }

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;

    const [data, total] = await this.livestockRepository.findAndCount({
      where,
      relations: { seller: true },
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return { data, page: currentPage, limit: pageSize, total };
  }

  async getFeatured(): Promise<Livestock[]> {
    const cacheKey = this.getFeaturedCacheKey();
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to read featured livestock cache', err);
    }

    const featured = await this.livestockRepository.find({
      where: { isFeatured: true, status: LivestockStatus.PUBLISHED, isSold: false, isReserved: false },
      relations: { seller: true },
      take: 10,
      order: { createdAt: 'DESC' },
    });

    try {
      await this.redisService.set(cacheKey, JSON.stringify(featured), 300); // 5 mins
    } catch (err) {
      console.warn('Failed to write featured livestock cache', err);
    }

    return featured;
  }

  async findOne(id: number): Promise<Livestock> {
    const cacheKey = this.getItemCacheKey(id);
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to read livestock details cache', err);
    }

    const listing = await this.livestockRepository.findOne({
      where: { id },
      relations: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Livestock listing not found');
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(listing), 3600); // 1 hour
    } catch (err) {
      console.warn('Failed to write livestock details cache', err);
    }

    return listing;
  }

  async update(id: number, sellerId: number, dto: UpdateLivestockDto): Promise<Livestock> {
    const listing = await this.findOne(id);
    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    Object.assign(listing, dto);
    const updated = await this.livestockRepository.save(listing);

    await this.invalidateCache(id);
    await this.syncToSearch(updated);

    return updated;
  }

  async remove(id: number, sellerId: number): Promise<void> {
    const listing = await this.findOne(id);
    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    await this.livestockRepository.softRemove(listing);
    await this.invalidateCache(id);
    await this.meilisearchService.deleteDocument(LIVESTOCK_INDEX, id);
  }

  async verifyListing(id: number, isVerified: boolean): Promise<Livestock> {
    const listing = await this.findOne(id);
    listing.isVerified = isVerified;
    const updated = await this.livestockRepository.save(listing);

    await this.invalidateCache(id);
    await this.syncToSearch(updated);

    return updated;
  }

  async setFeatured(id: number, isFeatured: boolean): Promise<Livestock> {
    const listing = await this.findOne(id);
    listing.isFeatured = isFeatured;
    const updated = await this.livestockRepository.save(listing);

    await this.invalidateCache(id);
    return updated;
  }

  async reserveListing(id: number, isReserved: boolean): Promise<Livestock> {
    const listing = await this.findOne(id);
    listing.isReserved = isReserved;
    const updated = await this.livestockRepository.save(listing);

    await this.invalidateCache(id);
    await this.syncToSearch(updated);

    return updated;
  }

  async markSold(id: number, isSold: boolean): Promise<Livestock> {
    const listing = await this.findOne(id);
    listing.isSold = isSold;
    if (isSold) {
      listing.isReserved = false;
    }
    const updated = await this.livestockRepository.save(listing);

    await this.invalidateCache(id);
    await this.syncToSearch(updated);

    return updated;
  }

  async getMyListings(sellerId: number): Promise<Livestock[]> {
    return this.livestockRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async search(q: string, species?: string): Promise<Livestock[]> {
    if (!q) return [];

    const filter = species ? `species = "${species}"` : undefined;
    const hits = await this.meilisearchService.search<any>(LIVESTOCK_INDEX, q, { limit: 15, filter });
    if (hits !== null) {
      const ids = hits.map((h) => h.id);
      if (ids.length === 0) return [];
      return this.livestockRepository.find({
        where: { id: ids as any },
        relations: { seller: true },
      });
    }

    // fallback
    const where: any = [
      { breed: ILike(`%${q}%`), status: LivestockStatus.PUBLISHED, isSold: false, isReserved: false },
      { location: ILike(`%${q}%`), status: LivestockStatus.PUBLISHED, isSold: false, isReserved: false },
      { farmName: ILike(`%${q}%`), status: LivestockStatus.PUBLISHED, isSold: false, isReserved: false },
    ];
    if (species) {
      where.forEach((w: any) => (w.species = species));
    }

    return this.livestockRepository.find({
      where,
      relations: { seller: true },
      take: 15,
    });
  }

  private async syncToSearch(listing: Livestock): Promise<void> {
    await this.meilisearchService.indexDocument(LIVESTOCK_INDEX, {
      id: listing.id,
      species: listing.species,
      breed: listing.breed,
      farmName: listing.farmName,
      location: listing.location,
      price: listing.price,
      isVerified: listing.isVerified,
      isReserved: listing.isReserved,
      isSold: listing.isSold,
      status: listing.status,
    });
  }
}
