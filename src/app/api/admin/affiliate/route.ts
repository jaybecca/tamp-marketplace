import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const [networks, links, clicks, conversions] = await Promise.all([
      query('SELECT id,name,slug,base_url,active FROM affiliate_networks ORDER BY name'),
      query(`SELECT al.id,al.destination_url,al.active,al.tracking_code,m.name merchant,p.title product
             FROM affiliate_links al JOIN merchant_products mp ON mp.id=al.merchant_product_id
             JOIN merchants m ON m.id=mp.merchant_id JOIN products p ON p.id=mp.product_id ORDER BY al.updated_at DESC LIMIT 500`),
      query(`SELECT COUNT(*)::int AS total, COUNT(DISTINCT affiliate_link_id)::int AS links FROM affiliate_clicks`),
      query(`SELECT COUNT(*)::int AS total, COALESCE(SUM(commission_amount),0)::numeric AS commission FROM affiliate_conversions WHERE status='approved'`),
    ]);
    return NextResponse.json({ networks: networks.rows, links: links.rows, clicks: clicks.rows[0], conversions: conversions.rows[0] });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Affiliate data unavailable.' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const b = await request.json();
    const merchantProductId = String(b.merchant_product_id ?? '').trim();
    const destinationUrl = String(b.destination_url ?? '').trim();
    if (!merchantProductId || !/^https?:\/\//i.test(destinationUrl)) return NextResponse.json({ error: 'Merchant product and valid destination URL are required.' }, { status: 400 });
    const result = await query<{ id: string }>(
      `INSERT INTO affiliate_links(merchant_product_id,country_code,destination_url,tracking_provider,tracking_code,deep_link_template,active)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [merchantProductId, b.country_code ? String(b.country_code).toUpperCase() : null, destinationUrl,
        b.tracking_provider ? String(b.tracking_provider) : null, b.tracking_code ? String(b.tracking_code) : null,
        b.deep_link_template ? String(b.deep_link_template) : null, b.active !== false],
    );
    return NextResponse.json({ ok: true, id: result.rows[0].id });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Unable to save affiliate link.' }, { status });
  }
}
