import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler, successResponse, AppError } from '../utils/helpers';
import { createLead, checkDuplicateEmail } from '../services/LeadService';

const router = Router();

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many submissions. Please try again later.' } },
});

const leadSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  serviceType: z.string().optional(),
  projectType: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  pageSource: z.string().optional(),
  honeypot: z.string().optional(),
});

router.post(
  '/',
  leadLimiter,
  asyncHandler(async (req, res) => {
    const data = leadSchema.parse(req.body);
    if (data.honeypot) {
      return successResponse(res, { leadId: 'ok', confirmationMessage: 'Thank you!' }, 201);
    }

    const { submission, isDuplicate, leadCategory } = await createLead(data, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    successResponse(res, {
      leadId: submission.id,
      isDuplicate,
      leadCategory,
      confirmationMessage: 'Thank you for contacting DN Tech! We will get back to you within 1 business day.',
    }, 201);
  })
);

router.post(
  '/check-duplicate',
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const isDuplicate = await checkDuplicateEmail(email);
    successResponse(res, { isDuplicate });
  })
);

export default router;
