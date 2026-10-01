import { NextResponse } from 'next/server';
import { storeCurrencyRates } from '@/lib/pricing';
import { query } from '@/lib/db';
import { refreshLiveCurrencyRates, getLatestCurrencyRates } from '@/lib/currency-live';
import { rateLimit, clientIp } from '@/server/security-rate-limit';

export async function GET(request: Request) {
  const rl = await rateLimit(`rates-read:${clientIp(request)}`, 30, 60);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many rate requests.' }, { status: 429 });
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get('base') || 'USD').toUpperCase();
  const force = searchParams.get('refresh') === '1';
  const latest = await query<{ observed_at:string }>(`SELECT MAX(observed_at) observed_at FROM currency_rates WHERE base_currency=$1`, [base]);
  const stale = !latest.rows[0]?.observed_at || Date.now() - new Date(latest.rows[0].observed_at).getTime() > 60 * 60 * 1000;
  if (base === 'USD' && (force || stale)) {
    try { await refreshLiveCurrencyRates(); } catch { /* retain the last known good rates */ }
  }
  const rates = await getLatestCurrencyRates(base);
  return NextResponse.json({ base, rates, refreshed: force || stale });
}

export async function POST(request: Request) {
  const rl=await rateLimit(`rates:${clientIp(request)}`,10,60);
  if(!rl.allowed) return NextResponse.json({error:'Too many rate update requests.'},{status:429});
  const payload = await request.json();
  if (!payload?.base || !payload?.rates || typeof payload.rates !== 'object') return NextResponse.json({ error: 'base and rates are required' }, { status: 400 });
  const count = await storeCurrencyRates(payload);
  return NextResponse.json({ stored: count });
}
