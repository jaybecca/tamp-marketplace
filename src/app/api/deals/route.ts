import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get('country') || 'NG').trim().toUpperCase();
  const parsed = Number(request.nextUrl.searchParams.get('limit') || 24);
  const limit = Math.min(Math.max(Number.isFinite(parsed) ? Math.floor(parsed) : 24, 1), 50);
  if (!/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: 'Invalid destination country' }, { status: 400 });
  const result = await query(`SELECT d.id,d.title,d.description,d.discount_percent,d.starts_at,d.ends_at,
    p.slug product_slug,p.title product_title,m.slug merchant_slug,m.name merchant_name,
    mp.price,mp.old_price,mp.currency_code,al.id affiliate_link_id
    FROM deals d JOIN merchant_products mp ON mp.id=d.merchant_product_id
    JOIN products p ON p.id=mp.product_id AND p.active=TRUE
    JOIN merchants m ON m.id=mp.merchant_id AND m.active=TRUE
    JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$1 AND mca.status IN ('available','limited','product-dependent')
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id=mp.id AND pca.country_code=$1
    LEFT JOIN LATERAL (SELECT id FROM affiliate_links WHERE merchant_product_id=mp.id AND active=TRUE AND (country_code=$1 OR country_code IS NULL) ORDER BY (country_code IS NOT NULL) DESC,updated_at DESC LIMIT 1) al ON TRUE
    WHERE d.active=TRUE AND d.starts_at<=NOW() AND (d.ends_at IS NULL OR d.ends_at>=NOW())
      AND (d.country_code IS NULL OR d.country_code=$1)
      AND (pca.status IS NULL OR pca.status IN ('available','limited','product-dependent'))
      AND mp.old_price IS NOT NULL AND mp.old_price>mp.price
    ORDER BY d.discount_percent DESC NULLS LAST, mp.price ASC NULLS LAST LIMIT $2`, [country, limit]);
  return NextResponse.json({ country, deals: result.rows });
}
