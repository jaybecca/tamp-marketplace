import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const [countries, merchants, categories, products] = await Promise.all([
      query('SELECT code,name,currency_code,default_language,active FROM countries ORDER BY name'),
      query('SELECT id,name,slug,website_url,affiliate_network,active,verified_at,verification_status,verification_source,verification_notes FROM merchants ORDER BY name'),
      query('SELECT slug,name,icon,active FROM categories ORDER BY name'),
      query('SELECT p.id,p.slug,p.title,p.brand,p.category_slug,p.image_url,p.active,p.updated_at FROM products p ORDER BY p.updated_at DESC LIMIT 500'),
    ]);
    return NextResponse.json({ countries: countries.rows, merchants: merchants.rows, categories: categories.rows, products: products.rows });
  } catch (e) {
    const status = e instanceof Error && e.message === 'AUTH_REQUIRED' ? 401 : e instanceof Error && e.message === 'ADMIN_REQUIRED' ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? 'Authentication required.' : status === 403 ? 'Admin access required.' : 'Admin data unavailable.' }, { status });
  }
}
