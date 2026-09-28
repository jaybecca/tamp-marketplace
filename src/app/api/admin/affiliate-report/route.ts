import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function GET() {
  try { await requireAdmin();
    const [summary, merchants, countries] = await Promise.all([
      query(`SELECT COUNT(*)::int clicks, (SELECT COUNT(*)::int FROM affiliate_conversions) conversions, COALESCE((SELECT SUM(commission_amount) FROM affiliate_conversions WHERE status='approved'),0)::numeric approved_commission FROM affiliate_clicks`),
      query(`SELECT m.id,m.name,COUNT(DISTINCT ac.id)::int clicks,COUNT(DISTINCT cv.id)::int conversions,COALESCE(SUM(CASE WHEN cv.status='approved' THEN cv.commission_amount ELSE 0 END),0)::numeric commission FROM merchants m LEFT JOIN affiliate_links al ON true LEFT JOIN affiliate_clicks ac ON ac.affiliate_link_id=al.id LEFT JOIN merchant_products mp ON mp.id=al.merchant_product_id AND mp.merchant_id=m.id LEFT JOIN affiliate_conversions cv ON cv.affiliate_link_id=al.id GROUP BY m.id,m.name ORDER BY commission DESC`),
      query(`SELECT country_code,COUNT(*)::int clicks FROM affiliate_clicks WHERE country_code IS NOT NULL GROUP BY country_code ORDER BY clicks DESC`)
    ]);
    return NextResponse.json({ summary:summary.rows[0], merchants:merchants.rows, countries:countries.rows });
  } catch (e) { const c=e instanceof Error?e.message:''; return NextResponse.json({error:c==='AUTH_REQUIRED'?'Authentication required.':c==='ADMIN_REQUIRED'?'Admin access required.':'Report unavailable.'},{status:c==='AUTH_REQUIRED'?401:c==='ADMIN_REQUIRED'?403:500}); }
}
