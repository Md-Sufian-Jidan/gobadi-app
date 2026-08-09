import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiDiagnosis } from './ai-diagnosis.entity';
import { CreateAiDiagnosisDto } from './dto/create-ai-diagnosis.dto';
import { Doctor } from '../doctors/doctor.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class AiDiagnosisService {
  constructor(
    @InjectRepository(AiDiagnosis)
    private readonly aiDiagnosisRepository: Repository<AiDiagnosis>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async analyze(userId: number, dto: CreateAiDiagnosisDto): Promise<AiDiagnosis> {
    const { symptoms, images } = dto;

    // Simulated Heuristics based on symptoms
    let analysisResult = 'Healthy / Undetermined';
    let confidenceScore = 0.5;
    let recommendations = {
      isolationRequired: false,
      actions: ['Monitor temperature', 'Provide clean drinking water'],
    };

    const lowercaseSymptoms = symptoms.map((s) => s.toLowerCase());

    if (lowercaseSymptoms.includes('skin lesions') || lowercaseSymptoms.includes('lesions') || lowercaseSymptoms.includes('nodules')) {
      analysisResult = 'Lumpy Skin Disease (LSD)';
      confidenceScore = 0.88;
      recommendations = {
        isolationRequired: true,
        actions: [
          'Isolate the infected animal immediately to prevent herd transmission',
          'Apply antiseptic dressing to skin lesions',
          'Contact an animal nutritionist/veterinarian to formulate support diets',
        ],
      };
    } else if (lowercaseSymptoms.includes('blisters') || lowercaseSymptoms.includes('salivation') || lowercaseSymptoms.includes('fever')) {
      analysisResult = 'Foot-and-Mouth Disease (FMD)';
      confidenceScore = 0.92;
      recommendations = {
        isolationRequired: true,
        actions: [
          'Strict quarantine of farm area',
          'Wash mouth and hooves with 4% sodium carbonate solution',
          'Soft easily-digestible feeds for recovery period',
        ],
      };
    } else if (lowercaseSymptoms.includes('cough') || lowercaseSymptoms.includes('weight loss')) {
      analysisResult = 'Bovine Tuberculosis (TB)';
      confidenceScore = 0.76;
      recommendations = {
        isolationRequired: true,
        actions: [
          'Perform diagnostic skin testing for verification',
          'Avoid pooling milk from suspected animal',
          'Ensure optimal ventilation inside barns',
        ],
      };
    }

    // Discover recommended doctors (e.g. general veterinarians or matching specialties)
    let specialtyKeywords: string[] = [];
    if (analysisResult.includes('LSD') || analysisResult.includes('FMD')) {
      specialtyKeywords = ['Nutritionist', 'Veterinarian'];
    } else {
      specialtyKeywords = ['Surgeon', 'Veterinarian'];
    }

    const doctors = await this.doctorRepository.find({
      order: { rating: 'DESC' },
      take: 3,
    });
    const recommendedDoctorIds = doctors.map((doc) => doc.id);

    const diagnosis = this.aiDiagnosisRepository.create({
      userId,
      images,
      symptoms,
      analysisResult,
      confidenceScore,
      recommendations,
      recommendedDoctorIds,
    });

    const saved = await this.aiDiagnosisRepository.save(diagnosis);

    await this.notificationsService.createNotification(
      userId,
      'AI diagnosis ready',
      `Your AI diagnosis is ready: ${analysisResult}.`,
      NotificationType.AI_READY,
      'AiDiagnosis',
      String(saved.id),
    );

    return saved;
  }

  async getHistory(userId: number): Promise<AiDiagnosis[]> {
    return this.aiDiagnosisRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
