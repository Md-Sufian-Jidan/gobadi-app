import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  AppointmentsService,
  AppointmentWithPatient,
} from './appointments.service';
import type { AppointmentListFilter } from './appointments.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { Appointment, ConsultationType } from './appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('appointments')
@Controller('doctors')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get(':id/slots')
  @ApiOperation({
    summary: 'List open booking slots for a doctor on a given date',
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiQuery({ name: 'date', example: '2026-08-01' })
  @ApiResponse({ status: 200, description: 'List of available slot times' })
  async getSlots(
    @Param('id') id: string,
    @Query('date') date: string,
  ): Promise<string[]> {
    return this.appointmentsService.listAvailableSlots(parseInt(id, 10), date);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book an appointment slot with a doctor' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  @ApiResponse({ status: 409, description: 'Slot is no longer available' })
  async bookSlot(
    @Body() body: BookSlotDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Appointment> {
    return this.appointmentsService.bookAppointment(
      parseInt(body.doctorId, 10),
      user.sub,
      body.date,
      body.time,
      body.clinicId,
      body.serviceId,
      body.animalId,
      body.consultationType,
      body.reasonForConsultation,
      body.symptoms,
    );
  }

  @Get('bookings/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "List the current user's appointments (patient: own bookings, doctor: their bookings). Without page/limit, returns the full unpaginated list for backward compatibility.",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['today', 'previous', 'upcoming', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'consultationType',
    required: false,
    enum: ConsultationType,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filters by animal (patient) name',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async getBookings(
    @CurrentUser() user: JwtPayload,
    @Query('filter') filter?: AppointmentListFilter,
    @Query('consultationType') consultationType?: ConsultationType,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<
    AppointmentWithPatient[] | PaginatedResult<AppointmentWithPatient>
  > {
    return this.appointmentsService.listForUser(user.sub, user.role, {
      filter,
      consultationType,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('bookings/:id/reschedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reschedule an appointment (must be >2h before start)',
  })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled' })
  async reschedule(
    @Param('id') id: string,
    @Body() body: RescheduleAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Appointment> {
    return this.appointmentsService.rescheduleAppointment(
      parseInt(id, 10),
      user.sub,
      user.role,
      body.date,
      body.time,
    );
  }

  @Patch('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Cancel an appointment (must be >2h before start). Refunds the patient wallet if the appointment was paid.',
  })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  async cancel(
    @Param('id') id: string,
    @Body() body: CancelAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Appointment & { walletDeduction: number }> {
    return this.appointmentsService.cancelAppointment(
      parseInt(id, 10),
      user.sub,
      user.role,
      body,
    );
  }

  @Patch('bookings/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark an appointment as completed (doctor-only)' })
  @ApiResponse({ status: 200, description: 'Appointment completed' })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Appointment> {
    return this.appointmentsService.completeAppointment(
      parseInt(id, 10),
      user.sub,
    );
  }

  @Post('bookings/:id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get a join URL for an online consultation (placeholder pending video provider selection)',
  })
  @ApiResponse({ status: 200, description: 'Join URL' })
  async join(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ url: string }> {
    return this.appointmentsService.getJoinInfo(
      parseInt(id, 10),
      user.sub,
      user.role,
    );
  }
}
