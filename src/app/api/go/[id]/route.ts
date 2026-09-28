import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { recordAffiliateClick } from '@/server/affiliate/tracking';
import { getAffiliateDestination } from '@/server/affiliate/links';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestedCountry = new URL(request.url).searchParams.get('country') || undefined;
  const link = await getAffiliateDestination(id, requestedCountry);
  if (!link?.active) return NextResponse.json({ error: 'Affiliate link is unavailable.' }, { status: 404 });
  const url = new URL(request.url);
  const user = await getCurrentUser();
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  await recordAffiliateClick({
    affiliateLinkId: link.id,
    userId: user?.id,
    sessionId: request.headers.get('x-tamp-session'),
    countryCode: link.country_code,
    referrer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
    ip: forwarded,
  });
  return NextResponse.redirect(link.destination_url, 302);
}
