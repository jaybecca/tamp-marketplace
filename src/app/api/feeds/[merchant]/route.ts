import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { upsertFeedProducts, type FeedProduct } from '@/server/feeds/ingest';

export async function POST(request: Request, { params }: { params: Promise<{ merchant: string }> }) {
  const configured = process.env.AFFILIATE_FEED_API_KEY;
  if (!configured || request.headers.get('authorization') !== `Bearer ${configured}`) return NextResponse.json({ error: 'Feed authorization required.' }, { status: 401 });
  const { merchant } = await params;
  const merchantResult = await query<{ id: string }>('SELECT id FROM merchants WHERE slug=$1 AND active=true LIMIT 1', [merchant]);
  if (!merchantResult.rows[0]) return NextResponse.json({ error: 'Merchant not found.' }, { status: 404 });
  try {
    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products as FeedProduct[] : [];
    const imported = await upsertFeedProducts(merchantResult.rows[0].id, products);
    return NextResponse.json({ ok: true, merchant, received: products.length, imported });
  } catch {
    return NextResponse.json({ error: 'Feed import failed.' }, { status: 400 });
  }
}
