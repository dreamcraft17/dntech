import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validatePassword,
} from '../utils/auth';
import { asyncHandler, successResponse, AppError } from '../utils/helpers';
import { authenticate, AuthRequest, logActivity } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await logActivity(user.id, 'login', 'user', user.id, undefined, req.ip);

    const token = generateToken({ sub: user.id, email: user.email, role: user.role });

    successResponse(res, {
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user) {
      await logActivity(req.user.id, 'logout', 'user', req.user.id, undefined, req.ip);
    }
    successResponse(res, { message: 'Logged out successfully' });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, lastLogin: true },
    });
    successResponse(res, user);
  })
);

const forgotPasswordSchema = z.object({ email: z.string().email() });

router.post(
  '/forgot-password',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }),
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = uuidv4();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      // In production, send email with reset link
      console.log(`Password reset token for ${email}: ${token}`);
    }

    successResponse(res, { message: 'If the email exists, a reset link has been sent' });
  })
);

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body);

    if (!validatePassword(password)) {
      throw new AppError(
        400,
        'WEAK_PASSWORD',
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
    ]);

    successResponse(res, { message: 'Password reset successfully' });
  })
);

export default router;
