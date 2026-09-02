import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
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
import {
  TimeOffService,
  DoctorTimeOff,
  CreateTimeOffResult,
} from './time-off.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('block-times')
@Controller('doctors/:id/block-times')
export class BlockTimesController {
  constructor(
    private readonly timeOffService: TimeOffService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List a doctor's blocked time-off ranges (public)" })
  @ApiParam({ name: 'id', example: '1' })
  async list(@Param('id') id: string): Promise<DoctorTimeOff[]> {
    return this.timeOffService.list(parseInt(id, 10));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary:
      'Block a date range. Without force, conflicting appointments return a 409 with the conflict list and fee estimate; with force:true, conflicting appointments are cancelled, patients refunded, and the doctor wallet is debited.',
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 201, description: 'Time off blocked' })
  @ApiResponse({
    status: 409,
    description: 'Conflicting appointments exist and force was not set',
  })
  async create(
    @Param('id') id: string,
    @Body() body: CreateTimeOffDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreateTimeOffResult> {
    const doctor = await this.requireOwnDoctor(id, user.sub);
    return this.timeOffService.create(doctor.id, user.sub, body);
  }

  @Delete(':blockId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Remove a blocked time-off range' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiParam({ name: 'blockId', example: '1' })
  async remove(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    const doctor = await this.requireOwnDoctor(id, user.sub);
    await this.timeOffService.remove(doctor.id, parseInt(blockId, 10));
    return { success: true };
  }

  @Get('calculate-fee')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calculate cancellation fee for an appointment' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiQuery({ name: 'appointmentId', required: true })
  async calculateFee(
    @Param('id') id: string,
    @Query('appointmentId') appointmentId: string,
  ): Promise<{ cancellationFee: number; refundAmount: number }> {
    return this.timeOffService.calculateCancellationFee(
      parseInt(appointmentId, 10),
    );
  }

  private async requireOwnDoctor(id: string, userId: number) {
    const doctor = await this.doctorsService.getDoctorByUserId(userId);
    if (!doctor || doctor.id !== parseInt(id, 10)) {
      throw new ForbiddenException('You may only manage your own schedule');
    }
    return doctor;
  }
}
