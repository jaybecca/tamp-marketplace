import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const statuses = ['available', 'limited', 'product-dependent'];

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const slug = (p.get('slug') || '').trim().slice(0, 160);
  const country = (p.get('country') || 'NG').trim().toUpperCase();
  if (!slug || !/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: 'Product slug and valid country are required' }, { status: 400 });

  const result = await query(`SELECT p.slug,p.title,m.id merchant_id,m.name merchant_name,m.slug merchant_slug,
    mp.price,mp.old_price,mp.currency_code,mp.stock_status,
    coalesce(pca.status,mp.availability_status) product_status,
    mca.status merchant_status,
    pca.shipping_status,pca.shipping_cost,pca.shipping_currency,pca.estimated_min_days,pca.estimated_max_days,
    al.id affiliate_link_id
    FROM products p
    JOIN merchant_products mp ON mp.product_id=p.id
    JOIN merchants m ON m.id=mp.merchant_id AND m.active=TRUE
    JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$2 AND mca.status=ANY($3::text[])
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id=mp.id AND pca.country_code=$2
    LEFT JOIN LATERAL (SELECT id FROM affiliate_links WHERE merchant_product_id=mp.id AND active=TRUE AND (country_code=$2 OR country_code IS NULL) ORDER BY (country_code IS NOT NULL) DESC,updated_at DESC LIMIT 1) al ON TRUE
    WHERE p.active=TRUE AND p.slug=$1 AND (pca.status IS NULL OR pca.status=ANY($3::text[]))
    ORDER BY mp.price NULLS LAST,m.name`, [slug, country, statuses]);

  return NextResponse.json({ product: slug, country, merchants: result.rows });
}
