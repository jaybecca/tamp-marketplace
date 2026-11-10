import { NextResponse } from 'next/server';
import { generateAliExpressPromotionLink } from '@/server/affiliate/aliexpress-api';
import { clientIp, rateLimit } from '@/server/security-rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = await rateLimit(`aliexpress-link:${clientIp(request)}`, 20, 60);
  if (!limited.allowed) return NextResponse.json({ error: 'Too many link requests. Try again shortly.' }, { status: 429 });

  try {
    const body = await request.json() as { sourceUrl?: unknown };
    if (typeof body.sourceUrl !== 'string' || body.sourceUrl.length > 2048) {
      return NextResponse.json({ error: 'A valid sourceUrl is required.' }, { status: 400 });
    }
    const data = await generateAliExpressPromotionLink(body.sourceUrl);
    return NextResponse.json({ provider: 'aliexpress', data }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('AliExpress affiliate link generation failed', error);
    const message = error instanceof Error && /valid|only HTTPS|required/i.test(error.message)
      ? error.message : 'AliExpress link generation is temporarily unavailable.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
