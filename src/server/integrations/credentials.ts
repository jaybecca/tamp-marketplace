import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function key() {
  const secret = process.env.INTEGRATION_CREDENTIAL_KEY;
  if (!secret) throw new Error('INTEGRATION_CREDENTIAL_KEY is not configured');
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptCredential(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function decryptCredential(value: string) {
  const [ivRaw, tagRaw, dataRaw] = value.split('.');
  if (!ivRaw || !tagRaw || !dataRaw) throw new Error('Invalid credential ciphertext');
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataRaw, 'base64url')), decipher.final()]).toString('utf8');
}
