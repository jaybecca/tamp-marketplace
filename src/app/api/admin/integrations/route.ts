import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/server/lib/admin';
import { encryptCredential } from '@/server/integrations/credentials';

export async function GET() {
  try {
    await requireAdmin();
    const r = await query(`SELECT f.id,f.merchant_id,m.name merchant,f.feed_type,f.feed_url,f.adapter_key,f.schedule,f.active,f.next_sync_at,f.last_sync_at,f.last_sync_status,f.records_imported,f.records_rejected,f.credential_last4 FROM merchant_feed_configs f JOIN merchants m ON m.id=f.merchant_id ORDER BY f.updated_at DESC`);
    return NextResponse.json({ integrations: r.rows });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Integration data unavailable.' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const b = await request.json();
    const merchantId = String(b.merchant_id ?? '').trim();
    const feedType = String(b.feed_type ?? '').trim();
    if (!merchantId || !['api','csv','xml','json','affiliate-network'].includes(feedType)) return NextResponse.json({ error: 'Valid merchant_id and feed_type are required.' }, { status: 400 });
    const credential = typeof b.credential === 'string' ? b.credential.trim() : '';
    const encrypted = credential ? encryptCredential(credential) : null;
    const last4 = credential ? credential.slice(-4) : null;
    const schedule = b.schedule ? String(b.schedule) : 'daily';
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const r = await query<{ id: string }>(`INSERT INTO merchant_feed_configs(merchant_id,feed_type,feed_url,credential_ciphertext,credential_last4,adapter_key,schedule,active,next_sync_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, [merchantId,feedType,b.feed_url ? String(b.feed_url) : null,encrypted,last4,b.adapter_key ? String(b.adapter_key) : feedType,schedule,b.active !== false,next]);
    return NextResponse.json({ ok: true, feed_id: r.rows[0].id });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Unable to configure integration.' }, { status });
  }
}
