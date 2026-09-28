import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';
const statuses = new Set(['available','limited','product-dependent','not-available','unknown']);
export async function POST(req:Request){
  try {
    await requireAdmin(); const b=await req.json(); const type=String(b.type??''); const status=String(b.status??'');
    if(!statuses.has(status)) return NextResponse.json({error:'Invalid availability status.'},{status:400});
    if(type==='merchant-country'){await query(`INSERT INTO merchant_country_availability(merchant_id,country_code,status,source,verified_at,notes) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(merchant_id,country_code) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source,verified_at=EXCLUDED.verified_at,notes=EXCLUDED.notes`,[b.merchant_id,b.country_code,status,String(b.source??'admin'),b.verified_at?new Date(b.verified_at):null,b.notes?String(b.notes):null]);}
    else if(type==='product-country'){await query(`INSERT INTO product_country_availability(merchant_product_id,country_code,status,source,verified_at,notes) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(merchant_product_id,country_code) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source,verified_at=EXCLUDED.verified_at,notes=EXCLUDED.notes`,[b.merchant_product_id,b.country_code,status,String(b.source??'admin'),b.verified_at?new Date(b.verified_at):null,b.notes?String(b.notes):null]);}
    else return NextResponse.json({error:'Invalid availability type.'},{status:400});
    return NextResponse.json({ok:true});
  } catch(e){const s=e instanceof Error&&e.message==='AUTH_REQUIRED'?401:e instanceof Error&&e.message==='ADMIN_REQUIRED'?403:500;return NextResponse.json({error:'Unable to save availability.'},{status:s});}
}
