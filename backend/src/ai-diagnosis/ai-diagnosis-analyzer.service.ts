import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { AiService } from '../ai/ai.service';

export interface DiagnosisResult {
  analysisResult: string;
  confidenceScore: number;
  isolationRequired: boolean;
  recommendations: string[];
  recommendedDoctorIds: number[];
}

interface DoctorCandidate {
  id: number;
  specialty: string;
  experience: string;
  rating: number;
}

@Injectable()
export class AiDiagnosisAnalyzerService {
  private readonly logger = new Logger(AiDiagnosisAnalyzerService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly aiService: AiService,
  ) {}

  async diagnose(
    images: string[],
    symptoms: string[],
  ): Promise<DiagnosisResult> {
    const candidates: DoctorCandidate[] = (
      await this.doctorRepository.find({
        where: { isVerified: true },
        order: { rating: 'DESC' },
        take: 15,
        select: { id: true, specialty: true, experience: true, rating: true },
      })
    ).map((d) => ({
      id: d.id,
      specialty: d.specialty,
      experience: d.experience,
      rating: d.rating,
    }));

    try {
      const result = await this.aiService.diagnoseLivestock(
        images,
        symptoms,
        candidates,
      );

      return {
        analysisResult: result.analysisResult,
        confidenceScore: result.confidenceScore,
        isolationRequired: result.isolationRequired,
        recommendations: result.recommendations,
        recommendedDoctorIds: candidates
          .filter(() => result.symptoms?.length === 0 || true)
          .slice(0, 3)
          .map((c) => c.id),
      };
    } catch (err) {
      this.logger.error('AI diagnosis pipeline failed', err);
      return this.heuristicDiagnose(symptoms, candidates);
    }
  }

  private heuristicDiagnose(
    symptoms: string[],
    candidates: DoctorCandidate[],
  ): DiagnosisResult {
    let analysisResult = 'Healthy / Undetermined';
    let confidenceScore = 0.5;
    let isolationRequired = false;
    let recommendations = [
      'Monitor temperature',
      'Provide clean drinking water',
    ];

    const lowercaseSymptoms = symptoms.map((s) => s.toLowerCase());

    if (
      lowercaseSymptoms.includes('skin lesions') ||
      lowercaseSymptoms.includes('lesions') ||
      lowercaseSymptoms.includes('nodules')
    ) {
      analysisResult = 'Lumpy Skin Disease (LSD)';
      confidenceScore = 0.88;
      isolationRequired = true;
      recommendations = [
        'Isolate the infected animal immediately to prevent herd transmission',
        'Apply antiseptic dressing to skin lesions',
        'Contact an animal nutritionist/veterinarian to formulate support diets',
      ];
    } else if (
      lowercaseSymptoms.includes('blisters') ||
      lowercaseSymptoms.includes('salivation') ||
      lowercaseSymptoms.includes('fever')
    ) {
      analysisResult = 'Foot-and-Mouth Disease (FMD)';
      confidenceScore = 0.92;
      isolationRequired = true;
      recommendations = [
        'Strict quarantine of farm area',
        'Wash mouth and hooves with 4% sodium carbonate solution',
        'Soft easily-digestible feeds for recovery period',
      ];
    } else if (
      lowercaseSymptoms.includes('cough') ||
      lowercaseSymptoms.includes('weight loss')
    ) {
      analysisResult = 'Bovine Tuberculosis (TB)';
      confidenceScore = 0.76;
      isolationRequired = true;
      recommendations = [
        'Perform diagnostic skin testing for verification',
        'Avoid pooling milk from suspected animal',
        'Ensure optimal ventilation inside barns',
      ];
    }

    const specialtyKeywords =
      analysisResult.includes('LSD') || analysisResult.includes('FMD')
        ? ['Nutritionist', 'Veterinarian']
        : ['Surgeon', 'Veterinarian'];

    const recommendedDoctorIds = candidates
      .filter((c) =>
        specialtyKeywords.some((kw) =>
          c.specialty.toLowerCase().includes(kw.toLowerCase()),
        ),
      )
      .slice(0, 3)
      .map((c) => c.id);

    return {
      analysisResult,
      confidenceScore,
      isolationRequired,
      recommendations,
      recommendedDoctorIds:
        recommendedDoctorIds.length > 0
          ? recommendedDoctorIds
          : candidates.slice(0, 3).map((c) => c.id),
    };
  }
}
