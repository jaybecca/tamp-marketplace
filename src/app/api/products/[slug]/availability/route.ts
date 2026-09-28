import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await query(`SELECT * FROM marketplace_pricing_availability WHERE slug=$1 ORDER BY merchant_name, country_code`, [slug]);
  if (!result.rows.length) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product: slug, offers: result.rows });
}
