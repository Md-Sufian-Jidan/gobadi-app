import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(): Promise<Category[]> {
    return this.productsService.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(
    @Body() body: { name: string; slug: string; description?: string },
  ): Promise<Category> {
    return this.productsService.createCategory(body);
  }

  @Get('brands')
  @ApiOperation({ summary: 'List all product brands' })
  @ApiResponse({ status: 200, description: 'List of brands' })
  async getBrands(): Promise<Brand[]> {
    return this.productsService.getBrands();
  }

  @Post('brands')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product brand (Admin only)' })
  @ApiResponse({ status: 201, description: 'Brand created' })
  async createBrand(
    @Body() body: { name: string; slug: string; description?: string },
  ): Promise<Brand> {
    return this.productsService.createBrand(body);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search active products' })
  @ApiQuery({ name: 'q', example: 'feed' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, description: 'Search hits' })
  async search(
    @Query('q') q: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<Product[]> {
    return this.productsService.search(
      q,
      categoryId ? parseInt(categoryId, 10) : undefined,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List product catalog with optional pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiResponse({ status: 200, description: 'Catalog details' })
  async getCatalog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
  ): Promise<Product[] | PaginatedResult<Product>> {
    return this.productsService.getCatalog(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      categoryId ? parseInt(categoryId, 10) : undefined,
      brandId ? parseInt(brandId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Product info' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(parseInt(id, 10));
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get current stock level for a product' })
  @ApiParam({ name: 'id', example: '1' })
  async getStock(@Param('id') id: string): Promise<{ productId: number; stock: number }> {
    const stock = await this.productsService.getStock(parseInt(id, 10));
    return { productId: parseInt(id, 10), stock };
  }

  @Post(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add inventory stock for a product (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async addStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; batchNumber?: string; expiryDate?: string },
  ): Promise<{ success: boolean }> {
    const expiry = body.expiryDate ? new Date(body.expiryDate) : undefined;
    await this.productsService.addStock(
      parseInt(id, 10),
      body.quantity,
      body.batchNumber,
      expiry,
    );
    return { success: true };
  }
}
