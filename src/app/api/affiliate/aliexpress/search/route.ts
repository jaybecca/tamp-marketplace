import { NextResponse } from 'next/server';
import { searchAliExpressAffiliateProducts } from '@/server/affiliate/aliexpress-api';
import { clientIp, rateLimit } from '@/server/security-rate-limit';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const limited = await rateLimit(`aliexpress-search:${clientIp(request)}`, 20, 60);
  if (!limited.allowed) return NextResponse.json({ error: 'Too many product searches. Try again shortly.' }, { status: 429 });

  const url = new URL(request.url);
  const keywords = url.searchParams.get('q') || '';
  const country = url.searchParams.get('country') || 'US';
  const currency = url.searchParams.get('currency') || 'USD';
  const page = Number(url.searchParams.get('page') || 1);

  try {
    const data = await searchAliExpressAffiliateProducts({
      keywords, shipToCountry: country, targetCurrency: currency, page,
    });
    return NextResponse.json({ provider: 'aliexpress', data }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('AliExpress affiliate product search failed', error);
    const message = error instanceof Error && /required|two-letter|valid/i.test(error.message)
      ? error.message : 'AliExpress product search is temporarily unavailable.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
