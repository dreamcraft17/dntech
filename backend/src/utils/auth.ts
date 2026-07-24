import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

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
