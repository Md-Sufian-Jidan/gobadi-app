import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, EntityManager } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import {
  InventoryLedger,
  InventoryMovementType,
} from './inventory-ledger.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from '../redis/redis.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { PaginatedResult } from '../common/paginated-result.interface';

const PRODUCTS_INDEX = 'products';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(InventoryLedger)
    private readonly inventoryLedgerRepository: Repository<InventoryLedger>,
    private readonly redisService: RedisService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  // Cache helpers
  private getCatalogCacheKey(categoryId?: number): string {
    return categoryId
      ? `cache:products:cat:${categoryId}`
      : 'cache:products:catalog';
  }

  private getItemCacheKey(productId: number): string {
    return `cache:products:item:${productId}`;
  }

  private async invalidateCache(
    productId?: number,
    categoryId?: number,
  ): Promise<void> {
    try {
      await this.redisService.del(this.getCatalogCacheKey());
      await this.redisService.del(this.getCatalogCacheKey(categoryId));
      if (productId) {
        await this.redisService.del(this.getItemCacheKey(productId));
      }
    } catch (err) {
      console.warn('Failed to invalidate product cache', err);
    }
  }

  // Categories CRUD
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: [{ name: data.name }, { slug: data.slug }],
    });
    if (existing) {
      throw new BadRequestException('Category already exists');
    }
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  // Brands CRUD
  async createBrand(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: [{ name: data.name }, { slug: data.slug }],
    });
    if (existing) {
      throw new BadRequestException('Brand already exists');
    }
    const brand = this.brandRepository.create(data);
    return this.brandRepository.save(brand);
  }

  async getBrands(): Promise<Brand[]> {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }

  // Products CRUD
  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOneBy({ sku: dto.sku });
    if (existing) {
      throw new BadRequestException(
        `Product with SKU ${dto.sku} already exists`,
      );
    }

    const product = this.productRepository.create(dto);
    const saved = await this.productRepository.save(product);

    // Invalidate caches
    await this.invalidateCache(undefined, dto.categoryId);

    // Sync to Meilisearch
    await this.meilisearchService.indexDocument(PRODUCTS_INDEX, {
      id: saved.id,
      sku: saved.sku,
      name: saved.name,
      description: saved.description,
      price: saved.price,
      status: saved.status,
      visibility: saved.visibility,
      isPrescriptionRequired: saved.isPrescriptionRequired,
    });

    return saved;
  }

  async getCatalog(
    page?: number,
    limit?: number,
    categoryId?: number,
    brandId?: number,
  ): Promise<Product[] | PaginatedResult<Product>> {
    // Attempt cache read for main catalog page
    if (!page && !limit && !brandId) {
      const cacheKey = this.getCatalogCacheKey(categoryId);
      try {
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('Failed to read catalog cache', err);
      }
    }

    const where: any = { visibility: true, status: ProductStatus.PUBLISHED };
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    // Apply default limit of 50 if pagination is completely missing, ensuring resource safety
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 50;

    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: { category: true, brand: true },
      order: { name: 'ASC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    // Write cache and return plain list only if page and limit were originally omitted
    if (!page && !limit) {
      if (!brandId) {
        const cacheKey = this.getCatalogCacheKey(categoryId);
        try {
          await this.redisService.set(cacheKey, JSON.stringify(data), 1800); // 30 mins
        } catch (err) {
          console.warn('Failed to write catalog cache', err);
        }
      }
      return data;
    }

    return { data, page: currentPage, limit: pageSize, total };
  }

  async findOne(id: number): Promise<Product> {
    const cacheKey = this.getItemCacheKey(id);
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to read item cache', err);
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true, brand: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(product), 7200); // 2 hours
    } catch (err) {
      console.warn('Failed to write item cache', err);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const oldCategoryId = product.categoryId;

    Object.assign(product, dto);
    const updated = await this.productRepository.save(product);

    // Invalidate caches
    await this.invalidateCache(updated.id, oldCategoryId || undefined);
    if (dto.categoryId && dto.categoryId !== oldCategoryId) {
      await this.invalidateCache(undefined, dto.categoryId);
    }

    // Sync to Meilisearch
    await this.meilisearchService.indexDocument(PRODUCTS_INDEX, {
      id: updated.id,
      sku: updated.sku,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      status: updated.status,
      visibility: updated.visibility,
      isPrescriptionRequired: updated.isPrescriptionRequired,
    });

    return updated;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);

    // Invalidate caches
    await this.invalidateCache(id, product.categoryId || undefined);

    // Sync to Meilisearch
    await this.meilisearchService.deleteDocument(PRODUCTS_INDEX, id);
  }

  async search(q: string, categoryId?: number): Promise<Product[]> {
    if (!q) return [];
    // Query Meilisearch
    const filter = categoryId ? `categoryId = ${categoryId}` : undefined;
    const hits = await this.meilisearchService.search<any>(PRODUCTS_INDEX, q, {
      limit: 15,
      filter,
    });
    if (hits !== null) {
      const ids = hits.map((hit) => hit.id);
      if (ids.length === 0) return [];
      return this.productRepository.find({
        where: { id: ids as any },
        relations: { category: true, brand: true },
      });
    }

    // Database fallback
    const where: any = [
      {
        name: ILike(`%${q}%`),
        status: ProductStatus.PUBLISHED,
        visibility: true,
      },
      {
        sku: ILike(`%${q}%`),
        status: ProductStatus.PUBLISHED,
        visibility: true,
      },
      {
        description: ILike(`%${q}%`),
        status: ProductStatus.PUBLISHED,
        visibility: true,
      },
    ];
    if (categoryId) {
      where.forEach((w: any) => (w.categoryId = categoryId));
    }

    return this.productRepository.find({
      where,
      relations: { category: true, brand: true },
      take: 15,
    });
  }

  // Stock Ledger Management
  async getStock(productId: number, manager?: EntityManager): Promise<number> {
    const repo = manager
      ? manager.getRepository(InventoryLedger)
      : this.inventoryLedgerRepository;
    const result = await repo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.quantity)', 'sum')
      .where('ledger.productId = :productId', { productId })
      .getRawOne();
    return parseInt(result?.sum || '0', 10);
  }

  async addStock(
    productId: number,
    qty: number,
    batchNumber?: string,
    expiryDate?: Date,
    manager?: EntityManager,
  ): Promise<void> {
    if (qty <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    const repo = manager
      ? manager.getRepository(InventoryLedger)
      : this.inventoryLedgerRepository;
    const entry = repo.create({
      productId,
      movementType: InventoryMovementType.ADDITION,
      quantity: qty,
      batchNumber,
      expiryDate,
    });
    await repo.save(entry);
  }

  async reserveStock(
    productId: number,
    qty: number,
    referenceId: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (qty <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const executeReservation = async (em: EntityManager) => {
      // 1. Lock the Product entity row to serialize check and insert
      const product = await em.getRepository(Product).findOne({
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      // 2. Query current stock within transaction
      const stock = await this.getStock(productId, em);
      if (stock < qty) {
        throw new BadRequestException(
          `Insufficient stock for product ${productId}. Available: ${stock}`,
        );
      }

      // 3. Save reservation ledger entry within transaction
      const repo = em.getRepository(InventoryLedger);
      const entry = repo.create({
        productId,
        movementType: InventoryMovementType.RESERVATION,
        quantity: -qty,
        referenceId,
      });
      await repo.save(entry);
    };

    if (manager) {
      await executeReservation(manager);
    } else {
      // If no manager is passed, run in a dedicated transaction on the default datasource manager
      await this.productRepository.manager.transaction(async (em) => {
        await executeReservation(em);
      });
    }
  }

  async releaseStock(
    productId: number,
    qty: number,
    referenceId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(InventoryLedger)
      : this.inventoryLedgerRepository;
    const entry = repo.create({
      productId,
      movementType: InventoryMovementType.RESERVATION,
      quantity: qty,
      referenceId,
    });
    await repo.save(entry);
  }

  async commitStock(
    productId: number,
    qty: number,
    referenceId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const executeCommit = async (em: EntityManager) => {
      await this.releaseStock(productId, qty, referenceId, em);
      const repo = em.getRepository(InventoryLedger);
      const entry = repo.create({
        productId,
        movementType: InventoryMovementType.SALE,
        quantity: -qty,
        referenceId,
      });
      await repo.save(entry);
    };

    if (manager) {
      await executeCommit(manager);
    } else {
      await this.productRepository.manager.transaction(async (em) => {
        await executeCommit(em);
      });
    }
  }
}
