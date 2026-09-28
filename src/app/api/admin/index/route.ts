import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const result = await query(`UPDATE merchant_products SET last_indexed_at=NOW() RETURNING id`);
  await query(`UPDATE products SET search_vector=setweight(to_tsvector('simple',coalesce(title,'')),'A') || setweight(to_tsvector('simple',coalesce(brand,'')),'B') || setweight(to_tsvector('simple',coalesce(category_slug,'')),'C') || setweight(to_tsvector('simple',coalesce(description,'')),'D')`);
  return NextResponse.json({ indexedOffers: result.rowCount || 0, indexedAt: new Date().toISOString() });
}
