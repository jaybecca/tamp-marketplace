import { query } from '@/lib/db';
import { fingerprintProduct, normalizeFeedProduct } from './normalize';

export type FeedProduct = {
  sourceSku: string;
  title: string;
  sourceUrl: string;
  price?: number | null;
  currencyCode?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  brand?: string | null;
  categorySlug?: string | null;
  oldPrice?: number | null;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'preorder' | 'unknown';
  stockQuantity?: number | null;
  availabilityStatus?: 'available' | 'limited' | 'product-dependent' | 'not-available' | 'unknown';
  sourceUpdatedAt?: string | null;
  freshnessHours?: number;
};

export async function upsertFeedProducts(merchantId: string, products: FeedProduct[]) {
  let count = 0;
  for (const rawItem of products) {
    const item = normalizeFeedProduct(rawItem);
    if (!item) continue;
    const fingerprint = fingerprintProduct(item);
    const slugBase = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || item.sourceSku;
    const slug = `${slugBase}-${item.sourceSku.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;
    const product = await query<{ id: string }>(
      `INSERT INTO products(slug,title,description,brand,category_slug,image_url,active,source_updated_at)
       VALUES($1,$2,$3,$4,$5,$6,true,NOW())
       ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,brand=EXCLUDED.brand,
       category_slug=EXCLUDED.category_slug,image_url=EXCLUDED.image_url,source_updated_at=NOW(),updated_at=NOW()
       RETURNING id`,
      [slug,item.title,item.description ?? null,item.brand ?? null,item.categorySlug ?? null,item.imageUrl ?? null],
    );
    await query(`INSERT INTO product_source_keys(merchant_id,source_sku,normalized_key,product_id) VALUES($1,$2,$3,$4) ON CONFLICT(merchant_id,normalized_key) DO UPDATE SET product_id=EXCLUDED.product_id`, [merchantId,item.sourceSku,fingerprint,product.rows[0].id]).catch(() => {});
    await query(
      `INSERT INTO merchant_products(product_id,merchant_id,source_sku,source_url,price,currency_code,old_price,availability_status,stock_status,stock_quantity,price_source,price_updated_at,availability_checked_at,data_fresh_until,last_seen_at,source_updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'merchant-feed',CASE WHEN $5 IS NOT NULL THEN NOW() ELSE NULL END,NOW(),NOW()+make_interval(hours => $11),NOW(),$12)
       ON CONFLICT(product_id,merchant_id,source_sku) DO UPDATE SET source_url=EXCLUDED.source_url,price=EXCLUDED.price,currency_code=EXCLUDED.currency_code,old_price=EXCLUDED.old_price,
       availability_status=EXCLUDED.availability_status,stock_status=EXCLUDED.stock_status,stock_quantity=EXCLUDED.stock_quantity,price_source='merchant-feed',
       price_updated_at=CASE WHEN EXCLUDED.price IS NOT NULL THEN NOW() ELSE merchant_products.price_updated_at END,availability_checked_at=NOW(),
       data_fresh_until=EXCLUDED.data_fresh_until,last_seen_at=NOW(),source_updated_at=EXCLUDED.source_updated_at,updated_at=NOW()
       RETURNING id,price,currency_code,old_price,stock_status`,
      [product.rows[0].id,merchantId,item.sourceSku,item.sourceUrl,item.price ?? null,item.currencyCode ?? null,item.oldPrice ?? null,item.availabilityStatus ?? 'unknown',item.stockStatus ?? 'unknown',item.stockQuantity ?? null,item.freshnessHours ?? 24,item.sourceUpdatedAt ? new Date(item.sourceUpdatedAt) : new Date()],
    );
    if (item.price != null && item.currencyCode) {
      await query(`INSERT INTO price_history(merchant_product_id,price,currency_code,old_price,stock_status,source)
        SELECT id,$2,$3,$4,$5,'merchant-feed' FROM merchant_products WHERE product_id=$1 AND merchant_id=$6 AND source_sku=$7`,
        [product.rows[0].id,item.price,item.currencyCode,item.oldPrice ?? null,item.stockStatus ?? 'unknown',merchantId,item.sourceSku]);
    }
    count++;
  }
  return count;
}
