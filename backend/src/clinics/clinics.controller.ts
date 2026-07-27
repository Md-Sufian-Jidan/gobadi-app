import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { Clinic } from './clinic.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clinics with optional pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Clinics list' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Clinic[] | PaginatedResult<Clinic>> {
    return this.clinicsService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a clinic by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Clinic details' })
  async findOne(@Param('id') id: string): Promise<Clinic> {
    return this.clinicsService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLINIC, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new clinic profile (Clinic owner / Admin only)' })
  @ApiResponse({ status: 201, description: 'Clinic profile created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateClinicDto,
  ): Promise<Clinic> {
    return this.clinicsService.create(user.sub, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clinic profile details' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: Partial<CreateClinicDto>,
  ): Promise<Clinic> {
    return this.clinicsService.update(parseInt(id, 10), user.sub, user.role, dto);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a clinic profile (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async verifyClinic(
    @Param('id') id: string,
    @Body() body: { isVerified: boolean },
  ): Promise<Clinic> {
    return this.clinicsService.verifyClinic(parseInt(id, 10), body.isVerified);
  }

  @Post(':id/doctors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add doctor association to clinic (Owner/Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async addDoctor(
    @Param('id') id: string,
    @Body() body: { doctorId: number },
    @CurrentUser() user: JwtPayload,
  ): Promise<Clinic> {
    return this.clinicsService.addDoctor(parseInt(id, 10), body.doctorId, user.sub, user.role);
  }

  @Delete(':id/doctors/:doctorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove doctor association from clinic (Owner/Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiParam({ name: 'doctorId', example: '1' })
  async removeDoctor(
    @Param('id') id: string,
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Clinic> {
    return this.clinicsService.removeDoctor(parseInt(id, 10), parseInt(doctorId, 10), user.sub, user.role);
  }
}
