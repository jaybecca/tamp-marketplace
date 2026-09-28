import { query } from '@/lib/db';
import type { Product, MerchantOffer, AvailabilityStatus } from '@/data/marketplace';

const iconByCategory:Record<string,string>={electronics:'💻',wearables:'⌚',phones:'📱',laptops:'💻',fashion:'👕',shoes:'👟',beauty:'💄','home-living':'🛋️',sports:'⚽',toys:'🧸',automotive:'🚙',books:'📚',audio:'🎧'};

export async function getCatalogProducts(opts:{country?:string;q?:string;category?:string;brand?:string;merchant?:string;deals?:boolean;limit?:number}={}) : Promise<Product[]> {
  const country=(opts.country||'NG').toUpperCase();
  const values:any[]=[country]; const where:string[]=['p.active=TRUE','m.active=TRUE','mca.country_code=$1','mca.status IN (\'available\',\'limited\',\'product-dependent\')','(pca.status IS NULL OR pca.status IN (\'available\',\'limited\',\'product-dependent\'))','(mp.data_fresh_until IS NULL OR mp.data_fresh_until >= NOW())','(pca.data_fresh_until IS NULL OR pca.data_fresh_until >= NOW())'];
  if(opts.q){values.push(opts.q.slice(0,120));where.push(`(p.title ILIKE '%'||$${values.length}||'%' OR coalesce(p.brand,'') ILIKE '%'||$${values.length}||'%' OR coalesce(p.description,'') ILIKE '%'||$${values.length}||'%')`)}
  if(opts.category){values.push(opts.category);where.push(`lower(p.category_slug)=lower($${values.length})`)}
  if(opts.brand){values.push(opts.brand);where.push(`lower(coalesce(p.brand,''))=lower($${values.length})`)}
  if(opts.merchant){values.push(opts.merchant);where.push(`lower(m.slug)=lower($${values.length})`)}
  if(opts.deals) where.push('mp.old_price IS NOT NULL AND mp.old_price>mp.price');
  values.push(Math.min(Math.max(opts.limit||50,1),100));
  const rows=await query<any>(`SELECT p.slug,p.title,p.description,p.brand,p.category_slug, min(mp.price) price, min(mp.old_price) FILTER(WHERE mp.old_price>mp.price) old_price,
    min(mp.currency_code) currency_code, min(m.name) merchant, count(DISTINCT m.id)::int merchant_count,
    json_agg(json_build_object('merchant',m.name,'price',mp.price,'oldPrice',mp.old_price,'currency',mp.currency_code,'status',coalesce(pca.status,mp.availability_status),'deliveryNote',coalesce(pca.notes,''),'affiliateId',al.id) ORDER BY mp.price) offers
    FROM products p JOIN merchant_products mp ON mp.product_id=p.id JOIN merchants m ON m.id=mp.merchant_id
    JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$1
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id=mp.id AND pca.country_code=$1
    LEFT JOIN LATERAL (SELECT id FROM affiliate_links WHERE merchant_product_id=mp.id AND active=TRUE AND (country_code=$1 OR country_code IS NULL) ORDER BY (country_code IS NOT NULL) DESC,updated_at DESC LIMIT 1) al ON TRUE
    WHERE ${where.join(' AND ')}
    GROUP BY p.id ORDER BY min(mp.price) ASC LIMIT $${values.length}`,values);
  return rows.rows.map((r:any)=>{const offers=(r.offers||[]) as MerchantOffer[]; const primaryAffiliateId=(offers[0] as any)?.affiliateId as string|undefined; const price=Number(r.price||0); const old=Number(r.old_price||0); return {slug:r.slug,name:r.title,category:r.category_slug?.replaceAll('-',' ')||'Products',brand:r.brand||'',icon:iconByCategory[r.category_slug]||'🛍️',price,oldPrice:old||undefined,rating:0,reviews:0,merchant:r.merchant,affiliateId:primaryAffiliateId,discount:old>price?Math.round((1-price/old)*100):undefined,description:r.description||'',tags:[],offers};});
}

export async function getCatalogProduct(slug:string,country='NG'){
  const rows=await query<any>(`SELECT p.slug,p.title,p.description,p.brand,p.category_slug,
      min(mp.price) price,min(mp.old_price) FILTER(WHERE mp.old_price>mp.price) old_price,min(mp.currency_code) currency_code,min(m.name) merchant,
      json_agg(json_build_object('merchant',m.name,'price',mp.price,'oldPrice',mp.old_price,'currency',mp.currency_code,'status',coalesce(pca.status,mp.availability_status),'deliveryNote',coalesce(pca.notes,''),'affiliateId',al.id) ORDER BY mp.price) offers
    FROM products p JOIN merchant_products mp ON mp.product_id=p.id JOIN merchants m ON m.id=mp.merchant_id
    JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$2
    LEFT JOIN product_country_availability pca ON pca.merchant_product_id=mp.id AND pca.country_code=$2
    LEFT JOIN LATERAL (SELECT id FROM affiliate_links WHERE merchant_product_id=mp.id AND active=TRUE AND (country_code=$2 OR country_code IS NULL) ORDER BY (country_code IS NOT NULL) DESC,updated_at DESC LIMIT 1) al ON TRUE
    WHERE p.active=TRUE AND p.slug=$1 AND m.active=TRUE AND mca.status IN ('available','limited','product-dependent')
      AND (mp.data_fresh_until IS NULL OR mp.data_fresh_until>=NOW())
      AND (pca.data_fresh_until IS NULL OR pca.data_fresh_until>=NOW())
    GROUP BY p.id LIMIT 1`,[slug,country.toUpperCase()]);
  const r=rows.rows[0]; if(!r)return null;
  const offers=(r.offers||[]) as MerchantOffer[]; const price=Number(r.price||0); const old=Number(r.old_price||0);
  return {slug:r.slug,name:r.title,category:r.category_slug?.replaceAll('-',' ')||'Products',brand:r.brand||'',icon:iconByCategory[r.category_slug]||'🛍️',price,oldPrice:old||undefined,rating:0,reviews:0,merchant:r.merchant,affiliateId:(offers[0] as any)?.affiliateId,discount:old>price?Math.round((1-price/old)*100):undefined,description:r.description||'',tags:[],offers};
}

export async function getFeaturedMerchants(country='NG') {
  const r=await query<{slug:string;name:string;website_url:string;status:string}>(`SELECT m.slug,m.name,m.website_url,COALESCE(mca.status,'unknown') status FROM merchants m LEFT JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$1 WHERE m.active=TRUE AND COALESCE(mca.status,'unknown') IN ('available','limited','product-dependent') ORDER BY m.name LIMIT 8`,[country.toUpperCase()]);
  return r.rows;
}

export async function getActiveCategories() {
  const r=await query<{slug:string;name:string;icon:string|null}>(`SELECT slug,name,icon FROM categories WHERE active=TRUE ORDER BY name`);
  return r.rows;
}

export async function getActiveBrands() {
  const r=await query<{brand:string}>(`SELECT DISTINCT brand FROM products WHERE active=TRUE AND brand IS NOT NULL AND trim(brand)<>'' ORDER BY brand LIMIT 24`);
  return r.rows.map(x=>x.brand);
}
