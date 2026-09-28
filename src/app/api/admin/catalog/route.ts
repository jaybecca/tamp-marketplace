import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() || '';
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 500);
    const values: unknown[] = [];
    const where = q ? `WHERE (slug ILIKE $1 OR title ILIKE $1 OR COALESCE(brand,'') ILIKE $1 OR COALESCE(category_slug,'') ILIKE $1)` : '';
    if (q) values.push(`%${q}%`);
    values.push(limit);
    const rows = await query(`SELECT * FROM admin_catalog_summary ${where} ORDER BY latest_offer_update DESC NULLS LAST, title ASC LIMIT $${values.length}`, values);
    return NextResponse.json({ results: rows.rows });
  } catch (error) {
    const status = error instanceof Error && error.message === 'AUTH_REQUIRED' ? 401 : error instanceof Error && error.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: 'Unable to load catalog.' }, { status });
  }
}
