import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
export async function GET(request: NextRequest) {
  const slugs = request.nextUrl.searchParams.getAll('slug').map(s=>s.trim()).filter(Boolean).slice(0,4);
  const country = (request.nextUrl.searchParams.get('country') || 'NG').toUpperCase();
  if (!slugs.length) return NextResponse.json({ products: [], country });
  const result = await query(`SELECT p.slug,p.title,p.brand,p.category_slug,p.image_url, m.name merchant_name,m.slug merchant_slug,mp.price,mp.old_price,mp.currency_code,coalesce(pca.status,mp.availability_status) destination_status,al.id affiliate_link_id
    FROM products p JOIN merchant_products mp ON mp.product_id=p.id JOIN merchants m ON m.id=mp.merchant_id
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id=mp.id AND pca.country_code=$1
    LEFT JOIN LATERAL (SELECT id FROM affiliate_links WHERE merchant_product_id=mp.id AND active=TRUE AND (country_code=$1 OR country_code IS NULL) ORDER BY (country_code IS NOT NULL) DESC,updated_at DESC LIMIT 1) al ON TRUE
    WHERE p.active=TRUE AND p.slug = ANY($2::text[]) ORDER BY p.slug,mp.price`, [country, slugs]);
  return NextResponse.json({ products: result.rows, country });
}
