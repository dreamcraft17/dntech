import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET must be set in production. Refusing to start with an insecure default secret.'
  );
}

if (isProduction && !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    'JWT_REFRESH_SECRET must be set in production. Refusing to start with an insecure default secret.'
  );
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, type: 'refresh' };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Not a refresh token');
  }
  return payload;
}

export const AUTH_COOKIE_NAME = 'token';

/** Parses simple "15m" / "7d" / "1h" durations (as used by JWT_EXPIRES_IN) into milliseconds. */
function parseDurationMs(duration: string, fallbackMs: number): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]] as number;
  return value * unitMs;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: parseDurationMs(JWT_EXPIRES_IN, 15 * 60 * 1000),
  };
}

export function validatePassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SuperAdmin: ['*'],
  ContentManager: [
    'services', 'portfolio', 'blog', 'team', 'testimonials', 'media', 'faqs', 'careers',
    'leads:view', 'analytics', 'settings:view',
  ],
  Editor: [
    'services:view', 'portfolio:view', 'blog:view', 'team:view', 'testimonials:view',
    'leads:view', 'analytics:view',
  ],
  Viewer: [
    'services:view', 'portfolio:view', 'blog:view', 'team:view', 'testimonials:view',
    'leads:view', 'analytics:view',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(':');
  return perms.includes(`${resource}:view`) && permission.endsWith(':view');
}

export function canWrite(role: UserRole, resource: string): boolean {
  if (role === 'SuperAdmin' || role === 'ContentManager') return true;
  if (role === 'Editor') return true;
  return false;
}
