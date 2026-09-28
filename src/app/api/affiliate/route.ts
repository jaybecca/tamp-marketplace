import { NextResponse } from 'next/server';
import { resolveAffiliateLink } from '@/server/affiliate/revenue';
import { rateLimit, clientIp } from '@/server/security-rate-limit';

export async function GET(request: Request) {
  const rl=await rateLimit(`affiliate:${clientIp(request)}`,60,60);
  if(!rl.allowed) return NextResponse.json({error:'Too many affiliate requests.'},{status:429});
  const u = new URL(request.url);
  const merchantId = u.searchParams.get('merchant_id');
  const country = u.searchParams.get('country');
  if (!merchantId || !country || !/^[A-Za-z]{2}$/.test(country)) return NextResponse.json({ error: 'merchant_id and a two-letter country code are required.' }, { status: 400 });
  const link = await resolveAffiliateLink(merchantId, country);
  return NextResponse.json({ link: link ? { id: link.id, destination_url: link.destination_url, country_code: link.country_code } : null });
}
