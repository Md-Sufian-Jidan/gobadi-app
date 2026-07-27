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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service, ProviderType } from './service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active consulting services' })
  @ApiQuery({ name: 'providerType', required: false, enum: ProviderType })
  @ApiQuery({ name: 'providerId', required: false })
  @ApiResponse({ status: 200, description: 'Services list' })
  async findAll(
    @Query('providerType') providerType?: ProviderType,
    @Query('providerId') providerId?: string,
  ): Promise<Service[]> {
    return this.servicesService.findAll(
      providerType,
      providerId ? parseInt(providerId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a service by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Service details' })
  async findOne(@Param('id') id: string): Promise<Service> {
    return this.servicesService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.CLINIC, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new consulting service (Providers / Admin only)' })
  @ApiResponse({ status: 201, description: 'Service created' })
  async create(@Body() dto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.CLINIC, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service details (Providers / Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateServiceDto>,
  ): Promise<Service> {
    return this.servicesService.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.CLINIC, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate service by ID (Providers / Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(parseInt(id, 10));
  }
}
