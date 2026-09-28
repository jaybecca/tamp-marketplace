import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/server/security-rate-limit';

const clean = (value: unknown, max = 500) => String(value ?? '').slice(0, max);

export async function POST(req: Request) {
  try {
    const rl=await rateLimit(`client-error:${clientIp(req)}`,30,60);
    if(!rl.allowed) return NextResponse.json({error:'Too many monitoring events.'},{status:429});
    const body = await req.json();
    const message = clean(body?.message);
    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });
    console.error('TAMP_CLIENT_ERROR', {
      message,
      digest: clean(body?.digest, 120),
      path: clean(body?.path, 300),
      language: clean(body?.language, 20),
      userAgent: clean(req.headers.get('user-agent'), 300),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid monitoring payload' }, { status: 400 });
  }
}
