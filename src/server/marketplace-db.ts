import { query } from '@/lib/db';
import type { AvailabilityStatus, Product } from '@/data/marketplace';

export type DbCountry = { code:string; name:string; flag:string; currency:string; currencySymbol:string; region:string };
export type DbMerchant = { slug:string; name:string; websiteUrl:string; icon:string; type:string; status:AvailabilityStatus };
export type DbCategory = { slug:string; name:string; icon:string; count:number };

const countryMeta: Record<string,{flag:string;region:string;symbol:string}> = {
  NG:{flag:'🇳🇬',region:'West Africa',symbol:'₦'}, GH:{flag:'🇬🇭',region:'West Africa',symbol:'GH₵'}, KE:{flag:'🇰🇪',region:'East Africa',symbol:'KSh'},
  EG:{flag:'🇪🇬',region:'North Africa',symbol:'E£'}, MA:{flag:'🇲🇦',region:'North Africa',symbol:'MAD'}, UG:{flag:'🇺🇬',region:'East Africa',symbol:'USh'},
  SN:{flag:'🇸🇳',region:'West Africa',symbol:'CFA'}, CI:{flag:'🇨🇮',region:'West Africa',symbol:'CFA'}
};
const merchantMeta: Record<string,{icon:string;type:string}> = { amazon:{icon:'a',type:'amazon'}, jumia:{icon:'✦',type:'jumia'}, aliexpress:{icon:'AE',type:'ali'}, ebay:{icon:'e',type:'ebay'}, temu:{icon:'TEMU',type:'temu'} };
const iconByCategory: Record<string,string> = {electronics:'💻',wearables:'⌚',phones:'📱',laptops:'💻',fashion:'👕',shoes:'👟',beauty:'💄','home-living':'🛋️',sports:'⚽',toys:'🧸',automotive:'🚙',books:'📚',audio:'🎧'};

export async function getDbCountries(): Promise<DbCountry[]> {
  const r=await query<{code:string;name:string;currency_code:string;currency_symbol:string|null;flag_emoji:string|null;region:string|null}>(`SELECT code,name,currency_code,currency_symbol,flag_emoji,region FROM countries WHERE active=TRUE ORDER BY name`);
  return r.rows.map(x=>({code:x.code.trim(),name:x.name,currency:x.currency_code.trim(),currencySymbol:x.currency_symbol||x.currency_code.trim(),flag:x.flag_emoji||'🌍',region:x.region||'Africa'}));
}
export async function getDbCountry(code='NG') { const list=await getDbCountries(); return list.find(x=>x.code===code.toUpperCase())||list[0]; }
export async function getDbMerchants(country='NG'): Promise<DbMerchant[]> {
  const r=await query<{slug:string;name:string;website_url:string;status:string;icon:string|null;merchant_type:string|null}>(`SELECT m.slug,m.name,m.website_url,COALESCE(mca.status,'unknown') status,m.icon,m.merchant_type FROM merchants m LEFT JOIN merchant_country_availability mca ON mca.merchant_id=m.id AND mca.country_code=$1 WHERE m.active=TRUE ORDER BY m.name`,[country.toUpperCase()]);
  return r.rows.map(x=>({slug:x.slug,name:x.name,websiteUrl:x.website_url,icon:x.icon||x.name.slice(0,1),type:x.merchant_type||x.slug,status:(x.status||'unknown') as AvailabilityStatus}));
}
export async function getDbCategories(): Promise<DbCategory[]> {
  const r=await query<{slug:string;name:string;icon:string|null;count:string}>(`SELECT c.slug,c.name,c.icon,COUNT(p.id)::text count FROM categories c LEFT JOIN products p ON p.category_slug=c.slug AND p.active=TRUE WHERE c.active=TRUE GROUP BY c.slug,c.name,c.icon ORDER BY c.name`);
  return r.rows.map(x=>({slug:x.slug,name:x.name,icon:x.icon||'🛍️',count:Number(x.count)}));
}
export function productFromDb(r:any): Product {
  const offers=(r.offers||[]) as Product['offers']; const price=Number(r.price||0); const old=Number(r.old_price||0);
  return {slug:r.slug,name:r.title,category:r.category_slug?.replaceAll('-',' ')||'Products',brand:r.brand||'',icon:iconByCategory[r.category_slug]||'🛍️',price,oldPrice:old||undefined,rating:Number(r.rating||0),reviews:Number(r.reviews||0),merchant:r.merchant||offers?.[0]?.merchant||'',affiliateId:offers?.[0]?.affiliateId,discount:old>price?Math.round((1-price/old)*100):undefined,description:r.description||'',tags:[],offers};
}
