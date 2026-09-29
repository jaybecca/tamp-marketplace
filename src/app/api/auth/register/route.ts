import { NextResponse } from 'next/server';
import { createSession, hashPassword } from '@/lib/auth';
import { query } from '@/lib/db'; import { ensureAuthSchema } from '@/lib/auth-schema';
import { rateLimit, clientIp } from '@/server/security-rate-limit';

export async function POST(request: Request) {
  const rl = await rateLimit(`auth-register:${clientIp(request)}`, 5, 60);
  if (!rl.allowed) return NextResponse.json({error:'Too many registration attempts. Please try again shortly.'},{status:429,headers:{'Retry-After':'60'}});
  try {
    await ensureAuthSchema();
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const consent = body.consent === true;
    if (!name || name.length < 2) return NextResponse.json({error:'Enter your full name.'},{status:400});
    const emailAt = email.indexOf('@');
    const emailDot = email.lastIndexOf('.');
    if (emailAt <= 0 || emailDot <= emailAt + 1 || emailDot >= email.length - 1 || email.includes(' ')) return NextResponse.json({error:'Enter a valid email address.'},{status:400});
    if (!consent) return NextResponse.json({error:'Please accept the Privacy Policy and Terms.'},{status:400});
    const passwordHash = await hashPassword(password);
    const countryHeader = request.headers.get('cf-ipcountry') || request.headers.get('x-country-code');
    const countryCode = countryHeader && /^[A-Za-z]{2}$/.test(countryHeader) ? countryHeader.toUpperCase() : null;
    const existing = await query<{id:string}>('SELECT id FROM users WHERE email=$1 LIMIT 1',[email]);
    if (existing.rowCount) return NextResponse.json({error:'An account with this email already exists.'},{status:409});
    const user = await query<{id:string}>('INSERT INTO users(email,name,password_hash,provider,consent_version,consent_at,country_code) VALUES($1,$2,$3,$4,$5,NOW(),$6) RETURNING id',[email,name,passwordHash,'email','2026-09-27',countryCode]);
    await query('INSERT INTO privacy_consents(user_id,consent_version,essential,analytics,marketing) VALUES($1,$2,true,false,false)',[user.rows[0].id,'2026-09-27']);
    await createSession(user.rows[0].id);
    return NextResponse.json({ok:true});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed.';
    const error = message === 'DATABASE_URL is not configured' ? 'Database is not configured.' : 'Registration failed. Please try again.';
    return NextResponse.json({error},{status:500});
  }
}
