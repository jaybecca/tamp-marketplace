import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseFeedPayload } from '@/server/feeds/parse';
import { upsertFeedProducts } from '@/server/feeds/ingest';
import { requireAdmin } from '@/server/lib/admin';

function freshnessHours(schedule?: string | null) {
  if (!schedule) return 24;
  if (/hour/i.test(schedule)) return 6;
  if (/daily/i.test(schedule)) return 24;
  if (/week/i.test(schedule)) return 168;
  return 24;
}

export async function POST() {
  try { await requireAdmin(); } catch (e) { const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : 403; return NextResponse.json({ error: status === 401 ? 'Authentication required.' : 'Admin access required.' }, { status }); }
  const configs = await query<{
    id: string; merchant_id: string; feed_url: string | null; feed_type: string; schedule: string | null;
  }>(`SELECT id, merchant_id, feed_url, feed_type, schedule FROM merchant_feed_configs WHERE active=TRUE`);

  const results = [];
  for (const cfg of configs.rows) {
    const run = await query<{ id: string }>(
      `INSERT INTO sync_runs(sync_type,merchant_id,status) VALUES('merchant-feed',$1,'running') RETURNING id`,
      [cfg.merchant_id],
    );
    if (!cfg.feed_url) {
      await query(`UPDATE sync_runs SET status='failed',completed_at=NOW(),error_message='No feed URL configured' WHERE id=$1`, [run.rows[0].id]);
      results.push({ merchantId: cfg.merchant_id, status: 'failed', reason: 'No feed URL configured' });
      continue;
    }
    try {
      const response = await fetch(cfg.feed_url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
      const text = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const products = parseFeedPayload(text, cfg.feed_type || 'json');
      const imported = products.length ? await upsertFeedProducts(cfg.merchant_id, products) : 0;
      await query(
        `UPDATE merchant_feed_configs SET last_sync_at=NOW(), last_sync_status='retrieved', last_sync_error=NULL, updated_at=NOW() WHERE id=$1`,
        [cfg.id],
      );
      await query(
        `UPDATE sync_runs SET status='completed',completed_at=NOW(),records_seen=$2,records_updated=$3 WHERE id=$1`, [run.rows[0].id, products.length, imported],
      );
      results.push({ merchantId: cfg.merchant_id, status: 'completed', bytes: text.length, contentType, recordsSeen: products.length, recordsUpdated: imported, freshnessHours: freshnessHours(cfg.schedule) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Feed retrieval failed';
      await query(`UPDATE merchant_feed_configs SET last_sync_at=NOW(), last_sync_status='failed', last_sync_error=$2, updated_at=NOW() WHERE id=$1`, [cfg.id, message]);
      await query(`UPDATE sync_runs SET status='failed',completed_at=NOW(),error_message=$2 WHERE id=$1`, [run.rows[0].id, message]);
      results.push({ merchantId: cfg.merchant_id, status: 'failed', reason: message });
    }
  }
  return NextResponse.json({ results });
}
