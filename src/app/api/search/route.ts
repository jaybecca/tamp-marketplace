import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const ALLOWED_STATUSES = ['available', 'limited', 'product-dependent'];
const SORTS = new Set(['relevance', 'price-asc', 'price-desc', 'merchant-count', 'newest']);

function positiveNumber(value: string | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const q = (p.get('q') || '').trim().slice(0, 120);
  const country = (p.get('country') || 'NG').trim().toUpperCase();
  const category = (p.get('category') || '').trim().slice(0, 120);
  const brand = (p.get('brand') || '').trim().slice(0, 120);
  const merchant = (p.get('merchant') || '').trim().slice(0, 120);
  const deals = p.get('deals') === '1';
  const sort = SORTS.has(p.get('sort') || '') ? p.get('sort')! : 'relevance';
  const min = positiveNumber(p.get('min'));
  const max = positiveNumber(p.get('max'));
  const limit = Math.min(Math.max(Math.floor(positiveNumber(p.get('limit'), 24)), 1), 50);
  const offset = Math.min(Math.floor(positiveNumber(p.get('offset'))), 10000);

  if (!/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: 'Invalid destination country' }, { status: 400 });
  }
  if (max > 0 && min > max) return NextResponse.json({ error: 'Invalid price range' }, { status: 400 });

  const values: unknown[] = [country, ALLOWED_STATUSES];
  const where: string[] = [
    'p.active = TRUE',
    'm.active = TRUE',
    `mca.country_code = $1`,
    `mca.status = ANY($2::text[])`,
    `(pca.status IS NULL OR pca.status = ANY($2::text[]))`,
  ];

  if (q) {
    values.push(q);
    const n = values.length;
    where.push(`(p.search_vector @@ websearch_to_tsquery('simple',$${n}) OR p.title ILIKE '%' || $${n} || '%' OR coalesce(p.brand,'') ILIKE '%' || $${n} || '%')`);
  }
  if (category) { values.push(category); where.push(`lower(p.category_slug) = lower($${values.length})`); }
  if (brand) { values.push(brand); where.push(`lower(coalesce(p.brand,'')) = lower($${values.length})`); }
  if (merchant) { values.push(merchant); where.push(`lower(m.slug) = lower($${values.length})`); }
  if (min > 0) { values.push(min); where.push(`mp.price >= $${values.length}`); }
  if (max > 0) { values.push(max); where.push(`mp.price <= $${values.length}`); }
  if (deals) where.push(`mp.deal_active = TRUE AND mp.old_price IS NOT NULL AND mp.old_price > mp.price`);

  const order = sort === 'price-asc' ? 'min(mp.price) ASC NULLS LAST'
    : sort === 'price-desc' ? 'min(mp.price) DESC NULLS LAST'
    : sort === 'merchant-count' ? 'COUNT(DISTINCT m.id) DESC, min(mp.price) ASC'
    : sort === 'newest' ? 'max(p.updated_at) DESC'
    : q ? 'max(ts_rank(p.search_vector, websearch_to_tsquery(\'simple\',$3))) DESC, min(mp.price) ASC'
    : 'min(mp.price) ASC NULLS LAST';

  // Keep the query parameterized. The only interpolated SQL fragments are fixed enums above.
  const from = `FROM products p
    JOIN merchant_products mp ON mp.product_id = p.id
    JOIN merchants m ON m.id = mp.merchant_id
    JOIN merchant_country_availability mca ON mca.merchant_id = m.id AND mca.country_code = $1
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id = mp.id AND pca.country_code = $1`;

  const count = await query(`SELECT count(DISTINCT p.id)::int AS total ${from} WHERE ${where.join(' AND ')}`, values);

  values.push(limit, offset);
  const limitPos = values.length - 1;
  const offsetPos = values.length;
  const rows = await query(`SELECT p.slug,p.title,p.brand,p.category_slug,p.image_url,
    min(mp.price) AS price,
    min(mp.currency_code) AS currency_code,
    count(DISTINCT m.id)::int AS merchant_count,
    min(mp.old_price) FILTER (WHERE mp.old_price > mp.price) AS old_price,
    json_agg(json_build_object('merchant',m.name,'merchantSlug',m.slug,'price',mp.price,'currency',mp.currency_code,'status',coalesce(pca.status,mp.availability_status)) ORDER BY mp.price NULLS LAST) AS offers
    ${from}
    WHERE ${where.join(' AND ')}
    GROUP BY p.id
    ORDER BY ${order}
    LIMIT $${limitPos} OFFSET $${offsetPos}`, values);

  return NextResponse.json({ results: rows, total: count.rows[0]?.total || 0, country, limit, offset, sort });
}
