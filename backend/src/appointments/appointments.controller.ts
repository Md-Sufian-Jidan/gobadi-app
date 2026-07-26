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
import { AppointmentsService } from './appointments.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { Appointment } from './appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';

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
  @Roles(UserRole.PATIENT)
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
    );
  }

  @Get('bookings/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "List the current user's appointments (patient: own bookings, doctor: their bookings)",
  })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async getBookings(@CurrentUser() user: JwtPayload): Promise<Appointment[]> {
    return this.appointmentsService.listForUser(user.sub, user.role);
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
  @ApiOperation({ summary: 'Cancel an appointment (must be >2h before start)' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Appointment> {
    return this.appointmentsService.cancelAppointment(
      parseInt(id, 10),
      user.sub,
      user.role,
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
}
