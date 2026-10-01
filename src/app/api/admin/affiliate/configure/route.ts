import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function POST() {
  try {
    await requireAdmin();
    const link=String(process.env.JUMIA_AFFILIATE_LINK||'').trim();
    if(!/^https?:\/\//i.test(link)) return NextResponse.json({error:'JUMIA_AFFILIATE_LINK is not configured.'},{status:400});
    const merchant=await query<{id:string}>("SELECT id FROM merchants WHERE slug='jumia' AND active=true LIMIT 1");
    if(!merchant.rows[0]) return NextResponse.json({error:'Jumia merchant is not configured.'},{status:404});
    const result=await query<{count:string}>(`WITH updated AS (UPDATE affiliate_links al SET destination_url=$1,tracking_provider='jumia-affiliate',active=true,updated_at=NOW() FROM merchant_products mp WHERE al.merchant_product_id=mp.id AND mp.merchant_id=$2 RETURNING al.id) SELECT COUNT(*)::text count FROM updated`,[link,merchant.rows[0].id]);
    await query(`INSERT INTO affiliate_routing_rules(merchant_id,country_code,affiliate_link_id,priority,active) SELECT mp.merchant_id,c.code,al.id,10,true FROM affiliate_links al JOIN merchant_products mp ON mp.id=al.merchant_product_id CROSS JOIN countries c WHERE mp.merchant_id=$1 AND al.active=true ON CONFLICT(merchant_id,country_code,affiliate_link_id) DO UPDATE SET priority=10,active=true`,[merchant.rows[0].id]);
    return NextResponse.json({ok:true,activated:Number(result.rows[0]?.count||0)});
  } catch(e) {
    const c=e instanceof Error?e.message:'';
    const status=c==='AUTH_REQUIRED'?401:c==='ADMIN_REQUIRED'?403:500;
    return NextResponse.json({error:status===401?'Authentication required.':status===403?'Admin access required.':'Unable to configure Jumia affiliate links.'},{status});
  }
}
