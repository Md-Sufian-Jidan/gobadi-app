import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DoctorsService, Doctor, Availability } from './doctors.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all doctors' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'specialty', required: false })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  async getDoctors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('specialty') specialty?: string,
  ): Promise<Doctor[] | PaginatedResult<Doctor>> {
    return this.doctorsService.getDoctors(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      specialty,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current logged-in doctor's own profile" })
  @ApiResponse({ status: 200, description: 'The doctor profile' })
  async getMyDoctorProfile(@CurrentUser() user: JwtPayload): Promise<Doctor> {
    const doctor = await this.doctorsService.getDoctorByUserId(user.sub);
    if (!doctor) {
      throw new ForbiddenException('No doctor profile linked to this account');
    }
    return doctor;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by id' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'The doctor' })
  async getDoctorById(@Param('id') id: string): Promise<Doctor> {
    return this.doctorsService.getDoctorById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: "Get a doctor's weekly availability" })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'List of availability windows' })
  async getAvailability(@Param('id') id: string): Promise<Availability[]> {
    return this.doctorsService.getAvailability(id);
  }

  @Post(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Replace a doctor's weekly availability (doctor-only, own profile)",
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 201, description: 'Availability replaced' })
  async setAvailability(
    @Param('id') id: string,
    @Body() body: SetAvailabilityDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Availability[]> {
    const doctor = await this.doctorsService.getDoctorByUserId(user.sub);
    if (!doctor || doctor.id !== parseInt(id, 10)) {
      throw new ForbiddenException('You may only manage your own availability');
    }
    return this.doctorsService.setAvailability(doctor.id, body.entries);
  }
}
