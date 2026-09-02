import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import {
  DiscountsService,
  DoctorPatient,
  PatientDiscount,
} from './discounts.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { EditDiscountDto } from './dto/edit-discount.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller()
export class DiscountsController {
  constructor(
    private readonly discountsService: DiscountsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Get('doctors/me/patients')
  @ApiOperation({
    summary:
      "List the current doctor's patients, with any active discount, for the discount screens",
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'discountGiven', required: false })
  @ApiResponse({ status: 200, description: 'List of patients' })
  async getMyPatients(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('discountGiven') discountGiven?: string,
  ): Promise<DoctorPatient[]> {
    const doctor = await this.requireDoctor(user.sub);
    return this.discountsService.getDoctorPatients(
      doctor.id,
      search,
      discountGiven === undefined ? undefined : discountGiven === 'true',
    );
  }

  @Get('discounts/:patientId')
  @ApiOperation({
    summary: 'Get the current discount (if any) for a patient',
  })
  @ApiParam({ name: 'patientId', example: '1' })
  async getDiscount(
    @Param('patientId') patientId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PatientDiscount | null> {
    const doctor = await this.requireDoctor(user.sub);
    return this.discountsService.getDiscount(
      doctor.id,
      parseInt(patientId, 10),
    );
  }

  @Post('discounts')
  @ApiOperation({
    summary: "Apply a discount to a patient's next appointment fee",
  })
  @ApiResponse({ status: 201, description: 'Discount applied' })
  async apply(
    @Body() body: ApplyDiscountDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PatientDiscount> {
    const doctor = await this.requireDoctor(user.sub);
    return this.discountsService.applyDiscount(
      doctor.id,
      body.patientId,
      body.percent,
    );
  }

  @Put('discounts/:id')
  @ApiOperation({ summary: 'Edit an existing discount' })
  @ApiParam({ name: 'id', example: '1' })
  async edit(
    @Param('id') id: string,
    @Body() body: EditDiscountDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PatientDiscount> {
    const doctor = await this.requireDoctor(user.sub);
    return this.discountsService.editDiscount(
      parseInt(id, 10),
      doctor.id,
      body.percent,
    );
  }

  @Delete('discounts/:id')
  @ApiOperation({ summary: 'Remove a discount' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    const doctor = await this.requireDoctor(user.sub);
    await this.discountsService.removeDiscount(parseInt(id, 10), doctor.id);
    return { success: true };
  }

  private async requireDoctor(userId: number) {
    const doctor = await this.doctorsService.getDoctorByUserId(userId);
    if (!doctor) {
      throw new ForbiddenException('No doctor profile linked to this account');
    }
    return doctor;
  }
}
