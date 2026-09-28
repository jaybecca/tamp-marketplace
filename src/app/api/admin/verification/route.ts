import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const b = await request.json();
    const merchantId = String(b.merchant_id ?? '').trim();
    const status = String(b.status ?? '').trim();
    const source = String(b.source ?? 'admin').trim();
    if (!merchantId || !['pending','verified','rejected'].includes(status) || !source) return NextResponse.json({ error: 'Invalid merchant verification data.' }, { status: 400 });
    await query(`INSERT INTO merchant_verifications(merchant_id,status,source,checked_by,notes) VALUES($1,$2,$3,$4,$5)`, [merchantId,status,source,admin.id,b.notes ? String(b.notes) : null]);
    await query(`UPDATE merchants SET verification_status=$1,verification_source=$2,verification_notes=$3,verified_at=CASE WHEN $1='verified' THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$4`, [status,source,b.notes ? String(b.notes) : null,merchantId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof Error ? e.message : '';
    const status = code === 'AUTH_REQUIRED' ? 401 : code === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Unable to verify merchant.' }, { status });
  }
}
