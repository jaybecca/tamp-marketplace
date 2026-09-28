import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/server/lib/admin';

export async function GET() {
  try { await requireAdmin(); const r = await query(`SELECT * FROM launch_checks ORDER BY category, label`); return NextResponse.json({ checks: r.rows }); }
  catch(e) { const s=e instanceof Error&&e.message==='AUTH_REQUIRED'?401:e instanceof Error&&e.message==='ADMIN_REQUIRED'?403:500; return NextResponse.json({error:'Launch checklist unavailable.'},{status:s}); }
}
export async function POST(req: Request) {
  try { const admin=await requireAdmin(); const b=await req.json(); const key=String(b.key??''); const status=String(b.status??'pending'); if(!key||!['pending','ready','blocked','waived'].includes(status)) return NextResponse.json({error:'Invalid launch check.'},{status:400}); const r=await query(`UPDATE launch_checks SET status=$1,notes=$2,checked_at=NOW(),checked_by=$3,updated_at=NOW() WHERE key=$4 RETURNING *`,[status,b.notes?String(b.notes):null,admin.id,key]); if(!r.rowCount) return NextResponse.json({error:'Launch check not found.'},{status:404}); return NextResponse.json({check:r.rows[0]}); }
  catch(e) { const s=e instanceof Error&&e.message==='AUTH_REQUIRED'?401:e instanceof Error&&e.message==='ADMIN_REQUIRED'?403:500; return NextResponse.json({error:'Unable to update launch check.'},{status:s}); }
}
