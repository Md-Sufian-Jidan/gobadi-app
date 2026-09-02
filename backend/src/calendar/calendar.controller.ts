import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get doctor monthly calendar' })
  @ApiParam({ name: 'doctorId', example: '1' })
  @ApiQuery({ name: 'month', example: '8' })
  @ApiQuery({ name: 'year', example: '2026' })
  async getDoctorMonthlyCalendar(
    @Param('doctorId') doctorId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.calendarService.getDoctorMonthlyCalendar(
      parseInt(doctorId, 10),
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }

  @Get('doctor/:doctorId/week')
  @ApiOperation({ summary: 'Get doctor weekly calendar' })
  @ApiParam({ name: 'doctorId', example: '1' })
  @ApiQuery({ name: 'date', example: '2026-08-25' })
  async getDoctorWeeklyCalendar(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.calendarService.getDoctorWeeklyCalendar(
      parseInt(doctorId, 10),
      date,
    );
  }

  @Get('appointments')
  @ApiOperation({ summary: "Get user's appointments grouped by view" })
  @ApiQuery({ name: 'date', example: '2026-08-25' })
  @ApiQuery({ name: 'view', enum: ['day', 'week', 'month'] })
  async getUserAppointments(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
    @Query('view') view: 'day' | 'week' | 'month',
  ) {
    return this.calendarService.getUserAppointments(user.sub, date, view);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get per-day appointment counts for a month' })
  @ApiQuery({ name: 'month', example: '8' })
  @ApiQuery({ name: 'year', example: '2026' })
  async getBadges(
    @CurrentUser() user: JwtPayload,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.calendarService.getBadges(
      user.sub,
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }
}
