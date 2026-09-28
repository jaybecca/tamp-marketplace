import { query } from '@/lib/db';

export type CurrencyRatePayload = {
  base: string;
  rates: Record<string, number>;
  observedAt?: string;
  source?: string;
};

export async function storeCurrencyRates(payload: CurrencyRatePayload) {
  const observedAt = payload.observedAt ? new Date(payload.observedAt) : new Date();
  const source = payload.source || 'external-provider';
  let updated = 0;
  for (const [quote, rate] of Object.entries(payload.rates)) {
    if (!Number.isFinite(rate) || rate <= 0 || quote.length !== 3) continue;
    await query(
      `INSERT INTO currency_rates(base_currency, quote_currency, rate, source, observed_at)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(base_currency,quote_currency,source,observed_at)
       DO UPDATE SET rate=EXCLUDED.rate, fetched_at=NOW()`,
      [payload.base.toUpperCase(), quote.toUpperCase(), rate, source, observedAt],
    );
    updated++;
  }
  return updated;
}

export async function convertAmount(amount: number, from: string, to: string) {
  if (from.toUpperCase() === to.toUpperCase()) return amount;
  const result = await query<{ rate: string }>(
    `SELECT rate FROM currency_rates
     WHERE base_currency=$1 AND quote_currency=$2
     ORDER BY observed_at DESC LIMIT 1`,
    [from.toUpperCase(), to.toUpperCase()],
  );
  if (!result.rows[0]) return null;
  return amount * Number(result.rows[0].rate);
}
