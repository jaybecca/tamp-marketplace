import { query } from '@/lib/db';

export async function resolveAffiliateLink(merchantId: string, countryCode: string) {
  const r = await query(`SELECT al.* FROM affiliate_routing_rules ar JOIN affiliate_links al ON al.id=ar.affiliate_link_id WHERE ar.merchant_id=$1 AND ar.country_code=$2 AND ar.active AND al.active ORDER BY ar.priority ASC, al.updated_at DESC LIMIT 1`, [merchantId, countryCode.toUpperCase()]);
  return r.rows[0] ?? null;
}

export async function recordCommissionLedger(conversionId: string) {
  const r = await query(`INSERT INTO affiliate_commission_ledger(conversion_id,merchant_id,network_name,external_transaction_id,status,commission_amount,currency_code) SELECT id,merchant_id,network_name,external_transaction_id,status,COALESCE(commission_amount,0),currency_code FROM affiliate_conversions WHERE id=$1 ON CONFLICT (conversion_id,status) DO UPDATE SET commission_amount=EXCLUDED.commission_amount,currency_code=EXCLUDED.currency_code,status=EXCLUDED.status RETURNING id`, [conversionId]);
  return r.rows[0]?.id ?? null;
}
