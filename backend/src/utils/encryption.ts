import crypto from 'crypto';

/**
 * Field-level encryption for customer-contact PII (lead/newsletter/quiz
 * email + phone). Not used for internal staff accounts (User.email) or
 * already-public business info (SiteSettings, TeamMember) — see
 * docs/runbooks/PII-FIELD-ENCRYPTION.md for the scoping rationale.
 */

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY must be set in production. Refusing to start with an insecure default key.'
  );
}

const rawKey = process.env.ENCRYPTION_KEY || 'dev-only-encryption-key-never-use-in-prod';
// SHA-256 of the configured secret gives a fixed 32-byte key regardless of
// the input string's length/encoding, same approach as the JWT secret.
const key = crypto.createHash('sha256').update(rawKey).digest();

/** AES-256-GCM encrypt. Output: "v1:<iv-b64>:<authTag-b64>:<ciphertext-b64>". */
export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function encryptFieldOrNull(plaintext: string | null | undefined): string | null {
  return plaintext ? encryptField(plaintext) : null;
}

/** Reverses encryptField. Throws on tampered/corrupt ciphertext (GCM auth tag check). */
export function decryptField(ciphertext: string): string {
  const [version, ivB64, tagB64, dataB64] = ciphertext.split(':');
  if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
    throw new Error('Unsupported or malformed ciphertext');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function decryptFieldOrNull(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  // Pre-migration rows (or anything written before encryption was enabled)
  // won't be in "v1:..." form — fail open to the raw value rather than
  // throwing, since this is read-path display logic, not a security boundary.
  if (!ciphertext.startsWith(`${VERSION}:`)) return ciphertext;
  return decryptField(ciphertext);
}

/**
 * Deterministic HMAC-SHA256 index for exact-match lookups (duplicate checks,
 * unique constraints, upserts) on fields whose actual value is encrypted
 * non-deterministically and therefore can't be queried directly.
 */
export function blindIndex(value: string): string {
  return crypto.createHmac('sha256', key).update(value.trim().toLowerCase()).digest('hex');
}
