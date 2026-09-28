import { query } from '@/lib/db';

export async function getAffiliateDestination(id: string, countryCode?: string) {
  const country = countryCode?.toUpperCase();
  const result = await query<{
    id: string; destination_url: string; active: boolean; merchant_id: string; country_code: string | null;
  }>(`SELECT al.id,al.destination_url,al.active,mp.merchant_id,al.country_code
      FROM affiliate_links al
      JOIN merchant_products mp ON mp.id=al.merchant_product_id
      JOIN merchants m ON m.id=mp.merchant_id AND m.active=TRUE
      WHERE al.id=$1 AND al.active=TRUE
        AND (al.country_code IS NULL OR $2::char(2) IS NULL OR al.country_code=$2)
        AND (mp.data_fresh_until IS NULL OR mp.data_fresh_until >= NOW())
      LIMIT 1`, [id, country || null]);
  return result.rows[0] ?? null;
}
