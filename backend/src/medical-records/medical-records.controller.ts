import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { Attachment } from './attachment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@ApiTags('medical-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAttachmentDto })
  @ApiOperation({
    summary:
      'Upload a medical file (PDF/image/DICOM) for background processing',
  })
  @ApiResponse({
    status: 201,
    description: 'Attachment created, status UPLOADED',
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAttachmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const patientId =
      user.role === UserRole.DOCTOR && body.patientId
        ? parseInt(body.patientId, 10)
        : user.sub;
    const appointmentId = body.appointmentId
      ? parseInt(body.appointmentId, 10)
      : undefined;
    return this.medicalRecordsService.createFromUpload(
      file,
      patientId,
      user.sub,
      appointmentId,
    );
  }

  @Get()
  @ApiQuery({ name: 'patientId', required: false })
  @ApiOperation({
    summary:
      'List medical records (own for patients, or ?patientId= for doctors)',
  })
  @ApiResponse({ status: 200, description: 'List of attachments' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('patientId') patientIdParam?: string,
  ): Promise<Attachment[]> {
    const patientId =
      user.role === UserRole.USER
        ? user.sub
        : patientIdParam
          ? parseInt(patientIdParam, 10)
          : undefined;
    if (!patientId) {
      throw new BadRequestException('patientId is required');
    }
    return this.medicalRecordsService.findForPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single attachment (ownership-checked)' })
  @ApiResponse({ status: 200, description: 'The attachment' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Attachment> {
    const attachment = await this.medicalRecordsService.findById(
      parseInt(id, 10),
    );
    if (user.role === UserRole.USER && attachment.patientId !== user.sub) {
      throw new ForbiddenException(
        'You may only access your own medical records',
      );
    }
    return attachment;
  }
}
