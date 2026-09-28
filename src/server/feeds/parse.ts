import type { FeedProduct } from './ingest';

function value(obj: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (obj[key] != null && String(obj[key]).trim() !== '') return obj[key];
  return undefined;
}

function mapItem(item: Record<string, unknown>): FeedProduct | null {
  const priceRaw = value(item,'price','sale_price','salePrice','current_price');
  const oldRaw = value(item,'oldPrice','old_price','regular_price','list_price');
  const price = priceRaw == null ? null : Number(String(priceRaw).replace(/[^0-9.-]/g,''));
  const oldPrice = oldRaw == null ? null : Number(String(oldRaw).replace(/[^0-9.-]/g,''));
  return {
    sourceSku:String(value(item,'sourceSku','source_sku','sku','id') ?? ''),
    title:String(value(item,'title','name','product_name') ?? ''),
    sourceUrl:String(value(item,'sourceUrl','source_url','url','link') ?? ''),
    price:Number.isFinite(price as number) ? price : null,
    oldPrice:Number.isFinite(oldPrice as number) ? oldPrice : null,
    currencyCode:String(value(item,'currencyCode','currency','currency_code') ?? ''),
    imageUrl:String(value(item,'imageUrl','image_url','image','thumbnail') ?? ''),
    description:String(value(item,'description','short_description') ?? ''),
    brand:String(value(item,'brand','manufacturer') ?? ''),
    categorySlug:String(value(item,'categorySlug','category_slug','category') ?? ''),
    stockStatus:String(value(item,'stockStatus','stock_status','availability') ?? 'unknown') as FeedProduct['stockStatus'],
    stockQuantity:Number(value(item,'stockQuantity','stock_quantity') ?? NaN) || null,
    availabilityStatus:String(value(item,'availabilityStatus','availability_status','shipping_status') ?? 'unknown') as FeedProduct['availabilityStatus'],
    sourceUpdatedAt:String(value(item,'sourceUpdatedAt','source_updated_at','updated_at','updatedAt') ?? '') || null,
    freshnessHours:Number(value(item,'freshnessHours','freshness_hours') ?? 24) || 24,
  };
}

export function parseFeedPayload(raw: string, feedType: string): FeedProduct[] {
  const type = feedType.toLowerCase();
  if (type === 'json' || type === 'api' || type === 'affiliate-network') {
    const parsed = JSON.parse(raw) as unknown;
    const items = Array.isArray(parsed) ? parsed : (parsed as any)?.products || (parsed as any)?.items || (parsed as any)?.data || [];
    return Array.isArray(items) ? items.map(x => mapItem(x as Record<string,unknown>)).filter(Boolean) as FeedProduct[] : [];
  }
  if (type === 'csv') {
    const lines = raw.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const split = (line:string) => line.match(/(?:"([^"]*)"|([^,]+))(?:,|$)/g)?.map(x=>x.replace(/,$/,'').replace(/^"|"$/g,'')) ?? [];
    const headers = split(lines[0]).map(x=>x.trim());
    return lines.slice(1).map(line => {
      const cells=split(line); return mapItem(Object.fromEntries(headers.map((h,i)=>[h,cells[i] ?? ''])));
    }).filter(Boolean) as FeedProduct[];
  }
  if (type === 'xml') {
    const items = [...raw.matchAll(/<(item|product|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>m[2]);
    return items.map(block => {
      const obj:Record<string,unknown>={};
      for (const tag of ['sku','id','title','name','link','url','price','sale_price','currency','brand','description','category','image','availability','stock']) {
        const m=block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i')); if(m) obj[tag]=m[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim();
      }
      return mapItem(obj);
    }).filter(Boolean) as FeedProduct[];
  }
  return [];
}
