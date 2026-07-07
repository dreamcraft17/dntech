import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { sendNewsletterWelcome } from '../services/EmailService';

const router = Router();

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post(
  '/subscribe',
  limiter,
  asyncHandler(async (req, res) => {
    const data = z.object({
      email: z.string().email(),
      name: z.string().optional(),
      industry: z.string().optional(),
      serviceType: z.string().optional(),
    }).parse(req.body);

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: data.email } });
    if (existing) {
      return successResponse(res, { message: 'You are already subscribed!', alreadySubscribed: true });
    }

    await prisma.newsletterSubscriber.create({ data });
    sendNewsletterWelcome(data.email).catch(console.error);

    successResponse(res, { message: 'Successfully subscribed to our newsletter!' }, 201);
  })
);

export default router;
