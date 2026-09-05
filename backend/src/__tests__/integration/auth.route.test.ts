import express from 'express';
import request from 'supertest';
import { UserRole } from '@prisma/client';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../utils/auth', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn().mockReturnValue('access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: jest.fn(),
  validatePassword: jest.fn().mockReturnValue(true),
  hashPassword: jest.fn().mockResolvedValue('hash'),
  AUTH_COOKIE_NAME: 'token',
  getAuthCookieOptions: jest.fn().mockReturnValue({
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 900000,
  }),
}));

jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', role: UserRole.SuperAdmin };
    next();
  },
  logActivity: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/EmailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const authRouter = require('../../routes/auth').default;
const prisma = require('../../config/database').default as {
  user: { findUnique: jest.Mock; update: jest.Mock };
  passwordResetToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  $transaction: jest.Mock;
};
const authUtils = require('../../utils/auth') as {
  comparePassword: jest.Mock;
  verifyRefreshToken: jest.Mock;
  validatePassword: jest.Mock;
  generateToken: jest.Mock;
  generateRefreshToken: jest.Mock;
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  app.use(errorHandler);
  return app;
}

describe('auth route integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authUtils.generateToken.mockReturnValue('access-token');
    authUtils.generateRefreshToken.mockReturnValue('refresh-token');
    authUtils.validatePassword.mockReturnValue(true);
  });

  it('logs in successfully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'admin@dntech.id',
      name: 'Admin',
      role: UserRole.SuperAdmin,
      passwordHash: 'hash',
      isActive: true,
    });
    authUtils.comparePassword.mockResolvedValueOnce(true);
    prisma.user.update.mockResolvedValueOnce({});
    const res = await request(buildApp()).post('/api/v1/auth/login').send({
      email: 'admin@dntech.id',
      password: 'Valid#123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBe('access-token');
  });

  it('rejects invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(buildApp()).post('/api/v1/auth/login').send({
      email: 'x@x.com',
      password: 'bad',
    });
    expect(res.status).toBe(401);
  });

  it('refreshes access token with valid refresh token', async () => {
    authUtils.verifyRefreshToken.mockReturnValueOnce({ sub: 'u1' });
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'admin@dntech.id',
      name: 'Admin',
      role: UserRole.SuperAdmin,
      isActive: true,
    });
    const res = await request(buildApp()).post('/api/v1/auth/refresh').send({
      refresh_token: 'valid',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBe('access-token');
  });

  it('returns 401 on invalid refresh token', async () => {
    authUtils.verifyRefreshToken.mockImplementationOnce(() => {
      throw new Error('invalid');
    });
    const res = await request(buildApp()).post('/api/v1/auth/refresh').send({
      refresh_token: 'invalid',
    });
    expect(res.status).toBe(401);
  });

  it('accepts forgot-password request without leaking user existence', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(buildApp()).post('/api/v1/auth/forgot-password').send({
      email: 'someone@dntech.id',
    });
    expect(res.status).toBe(200);
  });

  it('rejects weak reset password', async () => {
    authUtils.validatePassword.mockReturnValueOnce(false);
    const res = await request(buildApp()).post('/api/v1/auth/reset-password').send({
      token: 'abc',
      password: 'weakpass',
    });
    expect(res.status).toBe(400);
  });
});
