import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { LivestockService } from '../livestock/livestock.service';

export interface CartSummary {
  items: Array<{
    id: number;
    productId?: number;
    livestockId?: number;
    name: string;
    image?: string;
    unitPrice: number;
    discountPrice: number;
    quantity: number;
    rowTotal: number;
    isAvailable: boolean;
    warning?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly livestockService: LivestockService,
  ) {}

  async getCart(userId: number): Promise<CartSummary> {
    const dbItems = await this.cartRepository.find({
      where: { userId },
      relations: { product: true, livestock: true },
      order: { createdAt: 'ASC' },
    });

    const itemsSummary: any[] = [];
    let subtotal = 0;

    for (const item of dbItems) {
      let isAvailable = true;
      let warning: string | undefined;
      let name = '';
      let image: string | undefined;
      let unitPrice = 0;
      let discountPrice = 0;

      if (item.productId) {
        const prod = item.product;
        if (!prod) {
          isAvailable = false;
          warning = 'Product no longer exists';
        } else {
          name = prod.name;
          image = prod.images?.[0];
          unitPrice = prod.price;
          discountPrice = prod.price - (prod.discount || 0);

          const stock = await this.productsService.getStock(item.productId);
          if (stock < item.quantity) {
            isAvailable = false;
            warning = `Insufficient stock. Only ${stock} units available.`;
          }
        }
      } else if (item.livestockId) {
        const live = item.livestock;
        if (!live) {
          isAvailable = false;
          warning = 'Livestock listing no longer exists';
        } else {
          name = `${live.breed} (${live.species})`;
          image = live.images?.[0];
          unitPrice = live.price;
          discountPrice = live.price;

          if (live.isSold) {
            isAvailable = false;
            warning = 'This listing has already been sold';
          } else if (live.isReserved) {
            isAvailable = false;
            warning = 'This listing is currently reserved';
          }
        }
      } else {
        isAvailable = false;
        warning = 'Invalid cart item reference';
      }

      const activePrice = discountPrice || unitPrice;
      const rowTotal = activePrice * item.quantity;

      if (isAvailable) {
        subtotal += rowTotal;
      }

      itemsSummary.push({
        id: item.id,
        productId: item.productId || undefined,
        livestockId: item.livestockId || undefined,
        name,
        image,
        unitPrice,
        discountPrice,
        quantity: item.quantity,
        rowTotal,
        isAvailable,
        warning,
      });
    }

    const tax = Math.round(subtotal * 0.05); // 5% tax
    const shipping = subtotal > 0 ? 100 : 0; // Flat BDT 100 shipping
    const total = subtotal + tax + shipping;

    return {
      items: itemsSummary,
      subtotal,
      tax,
      shipping,
      total,
    };
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartItem> {
    const { productId, livestockId, quantity = 1 } = dto;

    if (productId && livestockId) {
      throw new BadRequestException('Cannot add both product and livestock in a single cart item');
    }
    if (!productId && !livestockId) {
      throw new BadRequestException('Must provide either productId or livestockId');
    }

    if (productId) {
      const prod = await this.productsService.findOne(productId);
      const stock = await this.productsService.getStock(productId);
      if (stock < quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${stock}`);
      }

      const existing = await this.cartRepository.findOneBy({ userId, productId });
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (stock < newQty) {
          throw new BadRequestException(`Insufficient stock. Total requested quantity ${newQty} exceeds available stock of ${stock}`);
        }
        existing.quantity = newQty;
        return this.cartRepository.save(existing);
      }

      const item = this.cartRepository.create({ userId, productId, quantity });
      return this.cartRepository.save(item);
    } else {
      const live = await this.livestockService.findOne(livestockId!);
      if (live.isSold || live.isReserved) {
        throw new BadRequestException('This livestock listing is not available for purchase');
      }

      const existing = await this.cartRepository.findOneBy({ userId, livestockId });
      if (existing) {
        return existing; // Unique livestock, quantity is 1
      }

      const item = this.cartRepository.create({ userId, livestockId, quantity: 1 });
      return this.cartRepository.save(item);
    }
  }

  async updateItem(id: number, userId: number, quantity: number): Promise<CartItem> {
    const item = await this.cartRepository.findOne({ where: { id }, relations: { product: true } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('You do not own this cart item');
    }

    if (item.productId) {
      const stock = await this.productsService.getStock(item.productId);
      if (stock < quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${stock}`);
      }
      item.quantity = quantity;
    } else {
      item.quantity = 1; // Livestock are unique
    }

    return this.cartRepository.save(item);
  }

  async removeItem(id: number, userId: number): Promise<void> {
    const item = await this.cartRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('You do not own this cart item');
    }
    await this.cartRepository.remove(item);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}
