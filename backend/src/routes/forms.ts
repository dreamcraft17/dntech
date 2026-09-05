import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse, AppError, detectDevice } from '../utils/helpers';
import {
  sendCareerConfirmation,
  sendCareerNotification,
  sendLeadNotification,
  sendWelcomeEmail,
} from '../services/EmailService';
import logger from '../config/logger';

const router = Router();

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Terlalu banyak pengiriman' } },
});

const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
  honeypot: z.string().optional(),
});

const serviceRequestSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  serviceInterested: z.string().min(1),
  message: z.string().min(10),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  honeypot: z.string().optional(),
});

const careerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().min(1),
  message: z.string().min(10),
  resumeUrl: z.string().optional(),
  honeypot: z.string().optional(),
});

async function createSubmission(
  data: Parameters<typeof prisma.formSubmission.create>[0]['data'],
  req: { ip?: string; headers: { 'user-agent'?: string } }
) {
  const submission = await prisma.formSubmission.create({
    data: {
      ...data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      eventType: 'form_submit',
      pageUrl: '/contact',
      deviceType: detectDevice(req.headers['user-agent']),
    },
  });

  return submission;
}

router.post(
  '/contact',
  formLimiter,
  asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);
    if (data.honeypot) {
      return successResponse(res, { message: 'Terima kasih atas pengiriman Anda' }, 201);
    }

    const submission = await createSubmission(
      {
        formType: 'contact',
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || 'Pertanyaan Umum',
        message: data.message,
      },
      req
    );

    sendWelcomeEmail(data.email, data.name, data.subject || 'Pertanyaan Umum').catch((err) => logger.error({ err }, "Background email send failed"));
    sendLeadNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectType: data.subject || 'Pertanyaan Umum',
      message: data.message,
      source: 'contact-form',
    }).catch((err) => logger.error({ err }, "Background email send failed"));

    successResponse(res, { id: submission.id, message: 'Terima kasih! Kami akan segera menghubungi Anda.' }, 201);
  })
);

router.post(
  '/service-request',
  formLimiter,
  asyncHandler(async (req, res) => {
    const data = serviceRequestSchema.parse(req.body);
    if (data.honeypot) {
      return successResponse(res, { message: 'Terima kasih atas pengiriman Anda' }, 201);
    }

    const submission = await createSubmission(
      {
        formType: 'service_request',
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        serviceInterested: data.serviceInterested,
        budgetRange: data.budgetRange,
        subject: `Permintaan Layanan: ${data.serviceInterested}`,
        message: data.message + (data.timeline ? `\n\nTimeline: ${data.timeline}` : ''),
      },
      req
    );

    sendWelcomeEmail(data.email, data.name, data.serviceInterested).catch((err) => logger.error({ err }, "Background email send failed"));
    sendLeadNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      serviceType: data.serviceInterested,
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      message: data.message,
      source: 'service-request',
    }).catch((err) => logger.error({ err }, "Background email send failed"));

    successResponse(res, { id: submission.id, message: 'Terima kasih! Kami akan segera menghubungi Anda.' }, 201);
  })
);

router.post(
  '/career',
  formLimiter,
  asyncHandler(async (req, res) => {
    const data = careerSchema.parse(req.body);
    if (data.honeypot) {
      return successResponse(res, { message: 'Terima kasih atas pengiriman Anda' }, 201);
    }

    const submission = await createSubmission(
      {
        formType: 'career',
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: `Lamaran Karier: ${data.position}`,
        message: data.message,
        resumeUrl: data.resumeUrl,
      },
      req
    );

    sendCareerNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      message: data.message,
      resumeUrl: data.resumeUrl,
    }).catch((err) => logger.error({ err }, "Background email send failed"));
    sendCareerConfirmation(data.email, data.name, data.position).catch((err) => logger.error({ err }, "Background email send failed"));

    successResponse(res, { id: submission.id, message: 'Terima kasih telah melamar! Kami akan meninjau lamaran Anda.' }, 201);
  })
);

export default router;
