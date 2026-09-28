import { query } from '@/lib/db';

const DEFAULT_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';

export async function refreshLiveCurrencyRates() {
  const endpoint = process.env.FX_RATE_API_URL || DEFAULT_ENDPOINT;
  const response = await fetch(endpoint, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Currency provider returned HTTP ${response.status}`);
  const payload = await response.json() as { result?: string; base_code?: string; rates?: Record<string, number> };
  const base = (payload.base_code || 'USD').toUpperCase();
  if (!payload.rates || typeof payload.rates !== 'object') throw new Error('Currency provider returned no rates');
  const observedAt = new Date();
  let stored = 0;
  for (const [quote, rate] of Object.entries(payload.rates)) {
    if (!Number.isFinite(rate) || rate <= 0 || quote.length !== 3) continue;
    await query(`INSERT INTO currency_rates(base_currency,quote_currency,rate,source,observed_at) VALUES($1,$2,$3,$4,$5)`, [base, quote.toUpperCase(), rate, endpoint, observedAt]);
    stored++;
  }
  return { base, rates: payload.rates, observedAt: observedAt.toISOString(), source: endpoint, stored };
}

export async function getLatestCurrencyRates(base = 'USD') {
  const result = await query<{ quote_currency:string; rate:string; observed_at:string; source:string }>(
    `SELECT DISTINCT ON (quote_currency) quote_currency,rate,observed_at,source FROM currency_rates WHERE base_currency=$1 ORDER BY quote_currency,observed_at DESC`,
    [base.toUpperCase()],
  );
  return Object.fromEntries(result.rows.map(row => [row.quote_currency, Number(row.rate)]));
}
