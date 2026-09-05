import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { sendQuizFollowUp } from '../services/EmailService';
import logger from '../config/logger';

const router = Router();

const RESULT_KEYWORDS: Record<string, string[]> = {
  enterprise: ['enterprise', 'erp', 'legacy'],
  product: ['mvp', 'startup', 'app', 'web', 'mobile'],
  cloud: ['cloud', 'scale', 'devops'],
  consulting: ['consulting', 'strategy', 'strategi'],
};

function findServiceRecommendation(
  resultKey: string,
  services: { name: string; slug: string; description: string; category: string | null }[],
) {
  const keywords = RESULT_KEYWORDS[resultKey] || [];
  const matched = services.find((s) => {
    const haystack = `${s.name} ${s.slug} ${s.category || ''} ${s.description}`.toLowerCase();
    return keywords.some((kw) => haystack.includes(kw));
  });
  if (matched) {
    return { service: matched.name, slug: matched.slug, description: matched.description };
  }
  if (services.length > 0) {
    const first = services[0];
    return { service: first.name, slug: first.slug, description: first.description };
  }
  return {
    service: 'Konsultasi',
    slug: null,
    description: 'Hubungi tim kami untuk rekomendasi personal sesuai kebutuhan bisnis Anda.',
  };
}

router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const data = z.object({
      sessionId: z.string().optional(),
      answers: z.record(z.string(), z.string()),
      email: z.string().email().optional(),
      name: z.string().optional(),
    }).parse(req.body);

    const values = Object.values(data.answers).join(' ').toLowerCase();
    let result = 'consulting';
    if (values.includes('enterprise') || values.includes('legacy') || values.includes('erp')) result = 'enterprise';
    else if (values.includes('mvp') || values.includes('startup') || values.includes('app')) result = 'product';
    else if (values.includes('cloud') || values.includes('scale') || values.includes('devops')) result = 'cloud';

    const services = await prisma.service.findMany({
      where: { status: 'active', deletedAt: null },
      orderBy: { displayOrder: 'asc' },
      select: { name: true, slug: true, description: true, category: true },
    });

    const recommendation = findServiceRecommendation(result, services);

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
      sendQuizFollowUp(data.email, data.name || 'Anda', recommendation.service).catch((err) => logger.error({ err }, "Background email send failed"));
    }

    successResponse(res, {
      id: submission.id,
      result,
      recommendation: { service: recommendation.service, description: recommendation.description },
    });
  })
);

export default router;
