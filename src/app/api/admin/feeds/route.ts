import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';
import { upsertFeedProducts, type FeedProduct } from '@/server/feeds/ingest';

export async function GET() {
  try {
    await requireAdmin();
    const r = await query(`SELECT f.id,f.merchant_id,m.name merchant,f.feed_type,f.feed_url,f.schedule,f.active,f.last_sync_at,f.last_sync_status,f.last_sync_error FROM merchant_feed_configs f JOIN merchants m ON m.id=f.merchant_id ORDER BY f.updated_at DESC`);
    return NextResponse.json({ feeds: r.rows });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Feed data unavailable.' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const b = await request.json();
    const merchantId = String(b.merchant_id ?? '').trim();
    const feedType = String(b.feed_type ?? '').trim();
    const products = Array.isArray(b.products) ? b.products as FeedProduct[] : [];
    if (!merchantId || !['api','csv','xml','json','affiliate-network'].includes(feedType)) return NextResponse.json({ error: 'Valid merchant_id and feed_type are required.' }, { status: 400 });
    const feed = await query<{ id: string }>(`INSERT INTO merchant_feed_configs(merchant_id,feed_type,feed_url,credential_ref,schedule,active) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
      [merchantId,feedType,b.feed_url ? String(b.feed_url) : null,b.credential_ref ? String(b.credential_ref) : null,b.schedule ? String(b.schedule) : null,b.active !== false]);
    const imported = products.length ? await upsertFeedProducts(merchantId, products) : 0;
    await query(`UPDATE merchant_feed_configs SET last_sync_at=NOW(),last_sync_status=$1,last_sync_error=NULL,updated_at=NOW() WHERE id=$2`, [products.length ? 'success' : 'configured',feed.rows[0].id]);
    return NextResponse.json({ ok: true, feed_id: feed.rows[0].id, imported });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Unable to configure feed.' }, { status });
  }
}
