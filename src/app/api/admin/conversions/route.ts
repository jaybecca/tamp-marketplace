import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const b = await request.json();
    const merchantId = String(b.merchant_id ?? '').trim();
    const status = String(b.status ?? 'pending').trim();
    if (!merchantId || !['pending','approved','reversed','rejected'].includes(status)) return NextResponse.json({ error: 'Invalid conversion data.' }, { status: 400 });
    const r = await query<{ id: string }>(`INSERT INTO affiliate_conversions(affiliate_link_id,merchant_id,network_name,external_order_id,external_transaction_id,status,order_value,commission_amount,currency_code,occurred_at,raw_payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`, [b.affiliate_link_id || null,merchantId,b.network_name || null,b.external_order_id || null,b.external_transaction_id || null,status,b.order_value ?? null,b.commission_amount ?? null,b.currency_code ? String(b.currency_code).toUpperCase() : null,b.occurred_at ? new Date(b.occurred_at) : null,b.raw_payload ?? null]);
    return NextResponse.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    const code = e instanceof Error ? e.message : '';
    const status = code === 'AUTH_REQUIRED' ? 401 : code === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Unable to record conversion.' }, { status });
  }
}
