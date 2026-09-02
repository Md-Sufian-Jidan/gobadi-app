import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrescriptionsService, Prescription } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    return this.prescriptionsService.create(user.sub, dto);
  }

  @Get('by-appointment/:appointmentId')
  @Get(':appointmentId')
  @ApiOperation({ summary: 'Get prescription by appointment ID' })
  @ApiParam({ name: 'appointmentId', example: '1' })
  async findByAppointmentId(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Prescription | null> {
    return this.prescriptionsService.findByAppointmentId(
      parseInt(appointmentId, 10),
      user.sub,
    );
  }

  @Get('by-animal/:animalId')
  @Get('animal/:animalId')
  @ApiOperation({ summary: "Get animal's prescription history" })
  @ApiParam({ name: 'animalId', example: '1' })
  async findByAnimalId(
    @Param('animalId') animalId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Prescription[]> {
    return this.prescriptionsService.findByAnimalId(
      parseInt(animalId, 10),
      user.sub,
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update a prescription' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    return this.prescriptionsService.update(
      parseInt(id, 10),
      user.sub,
      dto,
    );
  }

  @Post(':id/attachment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment for prescription' })
  @ApiParam({ name: 'id', example: '1' })
  async addAttachment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Prescription> {
    return this.prescriptionsService.addAttachment(
      parseInt(id, 10),
      user.sub,
      file,
    );
  }

  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Send prescription to owner' })
  @ApiParam({ name: 'id', example: '1' })
  async send(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Prescription> {
    return this.prescriptionsService.send(
      parseInt(id, 10),
      user.sub,
    );
  }
}
