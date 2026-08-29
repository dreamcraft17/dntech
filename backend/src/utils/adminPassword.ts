export const FORBIDDEN_ADMIN_PASSWORDS = new Set([
  'Admin@123456',
  'admin@123456',
  'password',
  'changeme',
]);

/** Local-only fallback. Never accepted when NODE_ENV=production. */
export const LOCAL_DEV_ADMIN_PASSWORD = 'DevOnly-LocalBootstrap-ChangeMe!';

export function resolveAdminPassword(env: NodeJS.ProcessEnv = process.env): string {
  const password = env.ADMIN_PASSWORD?.trim();
  const isProd = env.NODE_ENV === 'production';
  const invalid =
    !password || password.length < 12 || FORBIDDEN_ADMIN_PASSWORDS.has(password);

  if (invalid) {
    if (isProd) {
      throw new Error(
        'ADMIN_PASSWORD must be set (min 12 chars, not a default) before bootstrap seed in production.',
      );
    }
    return LOCAL_DEV_ADMIN_PASSWORD;
  }

  return password;
}
