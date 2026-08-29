import {
  FORBIDDEN_ADMIN_PASSWORDS,
  LOCAL_DEV_ADMIN_PASSWORD,
  resolveAdminPassword,
  shouldRotateAdminPassword,
} from '../../utils/adminPassword';

describe('shouldRotateAdminPassword', () => {
  it('is opt-in via ROTATE_ADMIN=1', () => {
    expect(shouldRotateAdminPassword({})).toBe(false);
    expect(shouldRotateAdminPassword({ ROTATE_ADMIN: 'true' })).toBe(false);
    expect(shouldRotateAdminPassword({ ROTATE_ADMIN: '1' })).toBe(true);
  });
});

describe('resolveAdminPassword', () => {
  it('returns a valid ADMIN_PASSWORD', () => {
    expect(
      resolveAdminPassword({ ADMIN_PASSWORD: 'CorrectHorseBattery1!', NODE_ENV: 'development' }),
    ).toBe('CorrectHorseBattery1!');
  });

  it('rejects documented defaults in production', () => {
    expect(() =>
      resolveAdminPassword({ ADMIN_PASSWORD: 'Admin@123456', NODE_ENV: 'production' }),
    ).toThrow(/ADMIN_PASSWORD must be set/);
    expect(FORBIDDEN_ADMIN_PASSWORDS.has('Admin@123456')).toBe(true);
  });

  it('throws in production when password is missing or too short', () => {
    expect(() => resolveAdminPassword({ NODE_ENV: 'production' })).toThrow(/ADMIN_PASSWORD/);
    expect(() =>
      resolveAdminPassword({ ADMIN_PASSWORD: 'short', NODE_ENV: 'production' }),
    ).toThrow(/ADMIN_PASSWORD/);
  });

  it('uses local fallback outside production', () => {
    expect(resolveAdminPassword({ NODE_ENV: 'development' })).toBe(LOCAL_DEV_ADMIN_PASSWORD);
    expect(resolveAdminPassword({ ADMIN_PASSWORD: 'Admin@123456', NODE_ENV: 'test' })).toBe(
      LOCAL_DEV_ADMIN_PASSWORD,
    );
  });
});
