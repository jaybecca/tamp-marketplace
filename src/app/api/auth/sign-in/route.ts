import { NextResponse } from 'next/server';
import { createSession, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db'; import { ensureAuthSchema } from '@/lib/auth-schema';
import { rateLimit, clientIp } from '@/server/security-rate-limit';
export async function POST(request: Request) {
  const rl = await rateLimit(`auth-signin:${clientIp(request)}`, 10, 60);
  if (!rl.allowed) return NextResponse.json({error:'Too many sign-in attempts. Please try again shortly.'},{status:429,headers:{'Retry-After':'60'}});
  try {
    await ensureAuthSchema();
    const body=await request.json(); const email=String(body.email??'').trim().toLowerCase(); const password=String(body.password??'');
    const result=await query<{id:string;password_hash:string|null}>('SELECT id,password_hash FROM users WHERE email=$1 AND active=true LIMIT 1',[email]);
    const user=result.rows[0];
    if(!user?.password_hash || !(await verifyPassword(password,user.password_hash))) return NextResponse.json({error:'Invalid email or password.'},{status:401});
    await createSession(user.id); return NextResponse.json({ok:true});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sign-in failed.';
    const error = message === 'DATABASE_URL is not configured' ? 'Database is not configured. Add DATABASE_URL to .env.example and restart the server.' : `Sign-in failed: ${message.slice(0,160)}`;
    return NextResponse.json({error},{status:500});
  }
}
