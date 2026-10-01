import { cookies } from 'next/headers';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { query } from './db';

const scrypt = (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
const SESSION_COOKIE = 'tamp_session';
const SESSION_DAYS = 30;
export const PASSWORD_RESET_MINUTES = 30;

export type User = { id: string; email: string; name: string; avatar_url: string | null; consent_version: string | null; role: 'customer' | 'admin' };

export function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }

export async function hashPassword(password: string) {
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex] = stored.split(':');
  if (scheme !== 'scrypt' || !salt || !hex) return false;
  const derived = (await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
  const expected = Buffer.from(hex, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}


export function createPasswordResetToken() {
  return randomBytes(32).toString('base64url');
}

export async function revokeUserSessions(userId: string) {
  await query('DELETE FROM auth_sessions WHERE user_id=$1', [userId]);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await query('INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [userId, hashToken(token), expires]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await query('DELETE FROM auth_sessions WHERE token_hash=$1', [hashToken(token)]);
  jar.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const result = await query<User>(`SELECT u.id,u.email,u.name,u.avatar_url,u.consent_version,u.role
    FROM auth_sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at > NOW() AND u.active=true LIMIT 1`, [hashToken(token)]);
  return result.rows[0] ?? null;
}
