import { createHash, randomUUID } from 'node:crypto';
import { query } from '@/lib/db';

export function hashIp(value: string | null | undefined) {
  if (!value) return null;
  const salt = process.env.TRACKING_HASH_SALT;
  if (!salt) throw new Error('TRACKING_HASH_SALT is not configured');
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export async function recordAffiliateClick(input: {
  affiliateLinkId: string;
  userId?: string | null;
  sessionId?: string | null;
  countryCode?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}) {
  const result = await query<{ id: string }>(
    `INSERT INTO affiliate_clicks(affiliate_link_id,user_id,session_id,country_code,referrer,user_agent,ip_hash)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [input.affiliateLinkId, input.userId ?? null, input.sessionId ?? randomUUID(), input.countryCode ?? null,
      input.referrer ?? null, input.userAgent ?? null, hashIp(input.ip)],
  );
  return result.rows[0]?.id;
}
