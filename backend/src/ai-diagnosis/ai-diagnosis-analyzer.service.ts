import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Doctor } from '../doctors/doctor.entity';

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

const MODEL = 'gpt-4o-mini';

@Injectable()
export class AiDiagnosisAnalyzerService {
  private readonly logger = new Logger(AiDiagnosisAnalyzerService.name);
  private client: OpenAI | null = null;

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      this.logger.log('OpenAI API configured for AI diagnosis.');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not found in env variables. Falling back to heuristic diagnosis.',
      );
    }
  }

  async diagnose(
    images: string[],
    symptoms: string[],
  ): Promise<DiagnosisResult> {
    // Sanitized doctor directory: only what's needed to judge specialty
    // relevance. Never expose userId, name, avatar, bio, qualifications,
    // licenseNumber, or consultationFee to the model.
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

    if (this.client) {
      try {
        return await this.diagnoseWithOpenAi(images, symptoms, candidates);
      } catch (err) {
        this.logger.error(
          'OpenAI diagnosis failed, falling back to heuristic',
          err,
        );
      }
    }

    return this.heuristicDiagnose(symptoms, candidates);
  }

  private async diagnoseWithOpenAi(
    images: string[],
    symptoms: string[],
    candidates: DoctorCandidate[],
  ): Promise<DiagnosisResult> {
    const candidateIds = new Set(candidates.map((c) => c.id));

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: [
          `Reported symptoms: ${symptoms.join(', ') || 'none provided'}`,
          '',
          `Available doctors (choose only from these ids, at most 3, if relevant):`,
          JSON.stringify(candidates),
        ].join('\n'),
      },
      ...images.map(
        (url): OpenAI.Chat.ChatCompletionContentPart => ({
          type: 'image_url',
          image_url: { url },
        }),
      ),
    ];

    const completion = await this.client!.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a livestock/farm-animal veterinary diagnostic assistant. ' +
            'Given reported symptoms and optional photos of the animal, identify the most ' +
            'likely condition and produce a short actionable care plan. ' +
            'Respond with a strict JSON object with exactly these fields: ' +
            '"analysisResult" (string, condition name), ' +
            '"confidenceScore" (number between 0 and 1), ' +
            '"isolationRequired" (boolean), ' +
            '"recommendations" (array of short action strings), ' +
            '"recommendedDoctorIds" (array of integers, chosen only from the ids in the ' +
            'candidate list provided, at most 3, empty array if none are relevant).',
        },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('OpenAI response had no content');
    }
    const parsed = JSON.parse(raw);

    if (
      typeof parsed.analysisResult !== 'string' ||
      !parsed.analysisResult.trim() ||
      typeof parsed.confidenceScore !== 'number' ||
      parsed.confidenceScore < 0 ||
      parsed.confidenceScore > 1 ||
      typeof parsed.isolationRequired !== 'boolean' ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error('OpenAI response failed shape validation');
    }

    // Hard safeguard: never trust model-returned ids beyond what we actually
    // offered it, regardless of what the model claims.
    const recommendedDoctorIds: number[] = Array.isArray(
      parsed.recommendedDoctorIds,
    )
      ? parsed.recommendedDoctorIds.filter(
          (id: unknown) => typeof id === 'number' && candidateIds.has(id),
        )
      : [];

    return {
      analysisResult: parsed.analysisResult,
      confidenceScore: parsed.confidenceScore,
      isolationRequired: parsed.isolationRequired,
      recommendations: parsed.recommendations.filter(
        (r: unknown): r is string => typeof r === 'string',
      ),
      recommendedDoctorIds,
    };
  }

  private heuristicDiagnose(
    symptoms: string[],
    candidates: DoctorCandidate[],
  ): DiagnosisResult {
    let analysisResult = 'Healthy / Undetermined';
    let confidenceScore = 0.5;
    let isolationRequired = false;
    let recommendations = ['Monitor temperature', 'Provide clean drinking water'];

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
