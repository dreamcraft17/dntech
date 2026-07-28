import { UserRole } from '@prisma/client';
import {
  canWrite,
  comparePassword,
  generateRefreshToken,
  generateToken,
  hasPermission,
  hashPassword,
  validatePassword,
  verifyRefreshToken,
  verifyToken,
} from '../../utils/auth';

describe('auth utils', () => {
  it('hashes and compares passwords', async () => {
    const raw = 'Secur3#Pass';
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    await expect(comparePassword(raw, hash)).resolves.toBe(true);
    await expect(comparePassword('wrong', hash)).resolves.toBe(false);
  });

  it('generates/verifies access and refresh tokens', () => {
    const access = generateToken({
      sub: 'u_1',
      email: 'admin@dntech.id',
      role: UserRole.SuperAdmin,
    });
    const decoded = verifyToken(access);
    expect(decoded.sub).toBe('u_1');
    expect(decoded.email).toBe('admin@dntech.id');

    const refresh = generateRefreshToken('u_1');
    const refreshDecoded = verifyRefreshToken(refresh);
    expect(refreshDecoded.sub).toBe('u_1');
    expect(refreshDecoded.type).toBe('refresh');
  });

  it('validates strong password format', () => {
    expect(validatePassword('Abcdef1#')).toBe(true);
    expect(validatePassword('weakpass')).toBe(false);
    expect(validatePassword('NoSpecial123')).toBe(false);
  });

  it('checks role permissions', () => {
    expect(hasPermission(UserRole.SuperAdmin, 'settings')).toBe(true);
    expect(hasPermission(UserRole.Viewer, 'services:view')).toBe(true);
    expect(hasPermission(UserRole.Viewer, 'services')).toBe(false);
    expect(canWrite(UserRole.Editor, 'blog')).toBe(true);
    expect(canWrite(UserRole.Viewer, 'blog')).toBe(false);
  });
});
