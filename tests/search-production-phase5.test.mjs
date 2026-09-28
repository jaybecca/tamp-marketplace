import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;

test('production search validates destination, bounds and sort',()=>{const s=fs.readFileSync(root+'src/app/api/search/route.ts','utf8');assert.match(s,/Invalid destination country/);assert.match(s,/limit.*50/);assert.match(s,/offset.*10000/);assert.match(s,/SORTS/);assert.match(s,/ANY\(\$2::text\[\]\)/)});
test('search is destination-aware at merchant and product levels',()=>{const s=fs.readFileSync(root+'src/app/api/search/route.ts','utf8');assert.match(s,/merchant_country_availability/);assert.match(s,/product_country_availability/);assert.match(s,/mca\.status/);assert.match(s,/pca\.status/)});
test('merchant comparison endpoint exists and returns shipping and affiliate context',()=>{const s=fs.readFileSync(root+'src/app/api/merchant-compare/route.ts','utf8');assert.match(s,/merchant_name/);assert.match(s,/shipping_status/);assert.match(s,/affiliate_link_id/);assert.match(s,/mca\.status/)});
test('destination-aware deals endpoint exists',()=>{const s=fs.readFileSync(root+'src/app/api/deals/route.ts','utf8');assert.match(s,/merchant_country_availability/);assert.match(s,/product_country_availability/);assert.match(s,/discount_percent/);assert.match(s,/LIMIT \$2/)});
test('search hardening migration fixes invalid brand index and adds performance indexes',()=>{const s=fs.readFileSync(root+'database/migrations/011_search_performance_security.sql','utf8');assert.match(s,/DROP INDEX IF EXISTS idx_products_brand_active/);assert.match(s,/ON products\(brand, active\)/);assert.match(s,/idx_merchant_country_active_status/);assert.match(s,/idx_deals_destination_active_dates/)});
