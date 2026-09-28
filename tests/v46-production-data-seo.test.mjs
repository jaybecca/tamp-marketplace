import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('v46 uses database-driven sitemap', () => {
  const s=read('src/app/sitemap.ts');
  assert.match(s,/SELECT slug,updated_at FROM products/);
  assert.match(s,/SELECT slug,updated_at FROM categories/);
  assert.match(s,/SELECT slug,updated_at FROM merchants/);
});

test('v46 product detail uses production catalog', () => {
  const s=read('src/app/products/[slug]/page.tsx');
  assert.match(s,/getCatalogProduct/);
  assert.doesNotMatch(s,/productBySlug\(slug\)/);
});

test('v46 freshness validation excludes stale offers', () => {
  const s=read('src/server/catalog.ts');
  assert.match(s,/mp\.data_fresh_until IS NULL OR mp\.data_fresh_until >= NOW\(\)/);
  assert.match(s,/pca\.data_fresh_until IS NULL OR pca\.data_fresh_until >= NOW\(\)/);
});

test('v46 feed synchronization parses and imports feed records', () => {
  const s=read('src/app/api/merchant-feeds/sync/route.ts');
  assert.match(s,/parseFeedPayload/);
  assert.match(s,/upsertFeedProducts/);
  assert.match(s,/records_updated/);
});

test('v46 live currency endpoint refreshes stale USD rates', () => {
  const s=read('src/app/api/pricing/rates/route.ts');
  assert.match(s,/refreshLiveCurrencyRates/);
  assert.match(s,/Date\.now\(\).*60 \* 60 \* 1000/);
});

test('v46 affiliate redirects validate destination freshness and country', () => {
  const s=read('src/server/affiliate/links.ts');
  assert.match(s,/data_fresh_until/);
  assert.match(s,/country_code/);
});

test('v46 fixes reported localization strings', () => {
  const s=read('src/components/localization.tsx');
  for (const key of ['Shop products and compare prices','50 practical, funny and useful guides for comparing products, prices, merchants and destinations across Africa and beyond.','Best Laptops Under $600 in 2025','Top 10 Smartphones in Nigeria 2025','Amazon vs Jumia: Which is Better?','Smart Home Gadgets for 2025','Practical tips, comparisons and smart shopping advice for everyday buyers.']) assert.match(s,new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('v46 Arabic RTL remains explicit at document level', () => {
  const s=read('src/components/localization.tsx');
  assert.match(s,/document\.documentElement\.dir = lang === 'ar' \? 'rtl' : 'ltr'/);
});

test('v46 homepage uses production catalog data for deals, merchants, categories and brands', () => {
  const s=read('src/app/page.tsx');
  assert.match(s,/getActiveCategories/); assert.match(s,/getFeaturedMerchants/); assert.match(s,/getCatalogProducts/); assert.match(s,/getActiveBrands/);
});

test('v46 homepage blog cards use stored localized post content', () => {
  const s=read('src/components/home-blog-localized.tsx');
  assert.match(s,/blogLocales/); assert.match(s,/localized\.title/); assert.match(s,/localized\.excerpt/);
});
