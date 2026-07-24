#!/usr/bin/env node
/**
 * Validates required environment variables before `next build`.
 * Loads .env files with the same precedence Next.js uses so this reflects
 * what the actual build will see, then fails fast if anything critical is missing.
 * Run: node scripts/validate-env.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nodeEnv = process.env.NODE_ENV || 'production';

function loadEnvFile(filename) {
  const filePath = resolve(rootDir, filename);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Next.js precedence, lowest priority loaded first so higher-priority files win
// (loadEnvFile only sets keys not already set).
loadEnvFile(`.env.${nodeEnv}.local`);
if (nodeEnv !== 'test') loadEnvFile('.env.local');
loadEnvFile(`.env.${nodeEnv}`);
loadEnvFile('.env');

const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SITE_URL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`ERROR: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

if (nodeEnv === 'production' && !process.env.NEXT_PUBLIC_API_URL.startsWith('https://')) {
  console.error('ERROR: NEXT_PUBLIC_API_URL must start with https:// in production');
  process.exit(1);
}

console.log('✓ All required env vars present and valid');
