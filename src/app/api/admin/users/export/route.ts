import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';
function csvCell(value: unknown) { const s = String(value ?? ''); return `"${s.replace(/"/g, '""')}"`; }
export async function GET() {
  try { await requireAdmin(); const r = await query<{name:string;email:string}>(`SELECT name,email FROM users ORDER BY created_at DESC LIMIT 10000`); const csv=['name,email',...r.rows.map(u=>`${csvCell(u.name)},${csvCell(u.email)}`)].join('\n'); return new NextResponse(csv,{status:200,headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="tamp-users.csv"','cache-control':'no-store'}}); }
  catch(e){const s=e instanceof Error&&e.message==='AUTH_REQUIRED'?401:e instanceof Error&&e.message==='ADMIN_REQUIRED'?403:500;return NextResponse.json({error:s===401?'Authentication required.':s===403?'Admin access required.':'User export unavailable.'},{status:s});}
}
