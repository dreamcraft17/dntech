import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  validatePassword,
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from '../utils/auth';
import { sendPasswordResetEmail } from '../services/EmailService';
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
    const refreshToken = generateRefreshToken(user.id);

    // Primary auth mechanism: httpOnly cookie (immune to XSS token theft).
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    // access_token/refresh_token are also returned in the body for backward
    // compatibility during the transition away from localStorage-based auth;
    // clients should prefer the cookie and stop reading these fields.
    successResponse(res, {
      access_token: token,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

const refreshSchema = z.object({ refresh_token: z.string().min(1) });

router.post(
  '/refresh',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  asyncHandler(async (req, res) => {
    const { refresh_token } = refreshSchema.parse(req.body);

    let payload;
    try {
      payload = verifyRefreshToken(refresh_token);
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
    }

    const accessToken = generateToken({ sub: user.id, email: user.email, role: user.role });
    res.cookie(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions());

    successResponse(res, { access_token: accessToken });
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user) {
      await logActivity(req.user.id, 'logout', 'user', req.user.id, undefined, req.ip);
    }
    const { maxAge: _maxAge, ...cookieOptions } = getAuthCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
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
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await sendPasswordResetEmail(user.email, user.name, token);
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
