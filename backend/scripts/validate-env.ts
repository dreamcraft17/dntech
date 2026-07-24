/**
 * Validates required environment variables before build/deploy.
 * Run: npx tsx scripts/validate-env.ts
 */
import 'dotenv/config';

const requiredEnvs = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing: string[] = [];

  requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  const frontendUrls = (process.env.FRONTEND_URL || '').split(',').map((u) => u.trim());
  for (const url of frontendUrls) {
    if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
      console.error(`❌ FRONTEND_URL entries must start with https:// in production (got "${url}")`);
      process.exit(1);
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'dev-secret-change-me') {
    console.error('❌ JWT_SECRET must not use the development default in production');
    process.exit(1);
  }

  console.log('✓ All required env vars present and valid');
}

validateEnv();
