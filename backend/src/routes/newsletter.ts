import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { sendNewsletterConfirmation, sendNewsletterWelcome } from '../services/EmailService';
import logger from '../config/logger';

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
    if (existing?.status === 'subscribed' && existing.isActive) {
      return successResponse(res, { message: 'Anda sudah berlangganan newsletter kami.', alreadySubscribed: true });
    }

    const confirmToken = crypto.randomBytes(32).toString('hex');
    const unsubToken = existing?.unsubToken || crypto.randomBytes(32).toString('hex');

    await prisma.newsletterSubscriber.upsert({
      where: { email: data.email },
      create: {
        ...data,
        status: 'pending',
        confirmToken,
        unsubToken,
        isActive: false,
      },
      update: {
        name: data.name,
        industry: data.industry,
        serviceType: data.serviceType,
        status: 'pending',
        confirmToken,
        unsubToken,
        isActive: false,
      },
    });

    sendNewsletterConfirmation(data.email, confirmToken).catch((err) => logger.error({ err }, "Background email send failed"));

    successResponse(res, { message: 'Email konfirmasi telah dikirim. Silakan cek inbox Anda.' }, 201);
  })
);

router.get(
  '/confirm',
  asyncHandler(async (req, res) => {
    const { token } = z.object({ token: z.string().min(16) }).parse(req.query);
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } });

    if (!subscriber) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token konfirmasi tidak valid.' } });
    }

    const unsubToken = subscriber.unsubToken || crypto.randomBytes(32).toString('hex');
    const updated = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'subscribed',
        isActive: true,
        confirmToken: null,
        unsubToken,
        confirmedAt: new Date(),
      },
    });

    sendNewsletterWelcome(updated.email, unsubToken).catch((err) => logger.error({ err }, "Background email send failed"));
    successResponse(res, { message: 'Newsletter berhasil dikonfirmasi.' });
  })
);

router.get(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { token } = z.object({ token: z.string().min(16) }).parse(req.query);
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubToken: token } });

    if (!subscriber) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token unsubscribe tidak valid.' } });
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    successResponse(res, { message: 'Anda telah berhenti berlangganan newsletter.' });
  })
);

export default router;
