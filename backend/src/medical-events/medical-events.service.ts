import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalEvent, MedicalEventType } from './medical-event.entity';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { UpdateMedicalEventDto } from './dto/update-medical-event.dto';
import { Appointment } from '../appointments/appointment.entity';
import { Animal } from '../animals/animal.entity';
import { PaginatedResult } from '../common/paginated-result.interface';
export { MedicalEvent, MedicalEventType } from './medical-event.entity';

@Injectable()
export class MedicalEventsService {
  constructor(
    @InjectRepository(MedicalEvent)
    private readonly medicalEventRepository: Repository<MedicalEvent>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
  ) {}

  async list(
    requesterUserId: number,
    requesterDoctorId: number | null,
    patientId: number,
    type?: MedicalEventType,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<MedicalEvent>> {
    await this.assertCanAccessPatient(
      requesterUserId,
      requesterDoctorId,
      patientId,
    );

    const where: Record<string, unknown> = { patientId };
    if (type) {
      where.type = type;
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const [data, total] = await this.medicalEventRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { data, page: currentPage, limit: pageSize, total };
  }

  async getById(
    id: number,
    requesterUserId: number,
    requesterDoctorId: number | null,
  ): Promise<MedicalEvent> {
    const event = await this.medicalEventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException('Medical event not found');
    }
    await this.assertCanAccessPatient(
      requesterUserId,
      requesterDoctorId,
      event.patientId,
    );
    return event;
  }

  async create(
    doctorId: number,
    patientId: number,
    dto: CreateMedicalEventDto,
  ): Promise<MedicalEvent> {
    const appointment = await this.appointmentRepository.findOneBy({
      id: dto.appointmentId,
    });
    if (
      !appointment ||
      appointment.doctorId !== doctorId ||
      appointment.patientId !== patientId
    ) {
      throw new ForbiddenException(
        'The appointment must belong to you and this patient',
      );
    }

    return this.medicalEventRepository.save(
      this.medicalEventRepository.create({
        patientId,
        appointmentId: dto.appointmentId,
        doctorId,
        type: dto.type,
        data: dto.data,
        nextFollowUpAt: dto.nextFollowUpAt
          ? new Date(dto.nextFollowUpAt)
          : null,
      }),
    );
  }

  async update(
    id: number,
    doctorId: number,
    dto: UpdateMedicalEventDto,
  ): Promise<MedicalEvent> {
    const event = await this.medicalEventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException('Medical event not found');
    }
    if (event.doctorId !== doctorId) {
      throw new ForbiddenException('You may only update your own records');
    }
    if (dto.status) {
      event.status = dto.status;
    }
    if (dto.data) {
      event.data = { ...event.data, ...dto.data };
    }
    return this.medicalEventRepository.save(event);
  }

  async delete(id: number, doctorId: number): Promise<void> {
    const event = await this.medicalEventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException('Medical event not found');
    }
    if (event.doctorId !== doctorId) {
      throw new ForbiddenException('You may only delete your own records');
    }
    await this.medicalEventRepository.remove(event);
  }

  private async assertCanAccessPatient(
    requesterUserId: number,
    requesterDoctorId: number | null,
    patientId: number,
  ): Promise<void> {
    if (requesterDoctorId) {
      const treated = await this.appointmentRepository.findOneBy({
        doctorId: requesterDoctorId,
        patientId,
      });
      if (treated) {
        return;
      }
    }
    const animal = await this.animalRepository.findOneBy({ id: patientId });
    if (animal?.userId === requesterUserId) {
      return;
    }
    throw new ForbiddenException(
      'You may only access medical records for your own animals or patients you have treated',
    );
  }
}
