import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { sendQuizFollowUp } from '../services/EmailService';

const router = Router();

const QUIZ_RESULTS: Record<string, { service: string; description: string }> = {
  enterprise: { service: 'Pengembangan Perangkat Lunak Enterprise', description: 'ERP, CRM, dan sistem skala besar kustom' },
  product: { service: 'Pengembangan Web & Mobile', description: 'MVP, aplikasi web, dan aplikasi mobile' },
  cloud: { service: 'Cloud & DevOps', description: 'Migrasi cloud, CI/CD, dan infrastruktur' },
  consulting: { service: 'Konsultasi & Strategi IT', description: 'Roadmap transformasi digital dan strategi teknologi' },
};

router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const data = z.object({
      sessionId: z.string().optional(),
      answers: z.record(z.string()),
      email: z.string().email().optional(),
      name: z.string().optional(),
    }).parse(req.body);

    // Score answers
    const values = Object.values(data.answers).join(' ').toLowerCase();
    let result = 'consulting';
    if (values.includes('enterprise') || values.includes('legacy') || values.includes('erp')) result = 'enterprise';
    else if (values.includes('mvp') || values.includes('startup') || values.includes('app')) result = 'product';
    else if (values.includes('cloud') || values.includes('scale') || values.includes('devops')) result = 'cloud';

    const recommendation = QUIZ_RESULTS[result];

    const submission = await prisma.quizSubmission.create({
      data: {
        sessionId: data.sessionId,
        answers: data.answers,
        result,
        recommendedService: recommendation.service,
        email: data.email,
        name: data.name,
      },
    });

    await prisma.analyticsEvent.create({
      data: { eventType: 'quiz_complete', pageUrl: '/quiz', conversionStatus: data.email ? 'converted' : 'partial' },
    });

    if (data.email) {
      sendQuizFollowUp(data.email, data.name || 'Anda', recommendation.service).catch(console.error);
    }

    successResponse(res, {
      id: submission.id,
      result,
      recommendation,
    });
  })
);

export default router;
