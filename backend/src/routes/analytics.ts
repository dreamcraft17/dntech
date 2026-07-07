import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse, detectDevice } from '../utils/helpers';
import { detectLeadSource, trackFunnelEvent } from '../services/LeadService';

const router = Router();

const trackSchema = z.object({
  eventType: z.string(),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  sessionId: z.string().optional(),
  referrer: z.string().optional(),
  leadSource: z.string().optional(),
});

router.post(
  '/track',
  asyncHandler(async (req, res) => {
    const data = trackSchema.parse(req.body);
    const leadSource = data.leadSource || detectLeadSource(data.referrer);

    await Promise.all([
      prisma.analyticsEvent.create({
        data: {
          eventType: data.eventType,
          pageUrl: data.pageUrl,
          pageTitle: data.pageTitle,
          sessionId: data.sessionId,
          referrer: data.referrer,
          userAgent: req.headers['user-agent'],
          deviceType: detectDevice(req.headers['user-agent']),
          leadSource,
        },
      }),
      trackFunnelEvent({
        sessionId: data.sessionId || 'anonymous',
        eventType: data.eventType,
        pageUrl: data.pageUrl || '/',
        leadSource,
        convertedToLead: data.eventType === 'form_submit',
      }),
    ]);

    successResponse(res, { tracked: true, timestamp: new Date().toISOString() });
  })
);

export default router;
