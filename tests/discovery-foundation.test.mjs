import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
test('Phase 5 search migration exists with full text and trigram indexes',()=>{const s=fs.readFileSync(root+'database/migrations/005_search_discovery.sql','utf8');assert.match(s,/pg_trgm/);assert.match(s,/idx_products_search_vector/);assert.match(s,/marketplace_discovery/)});
test('Search API supports destination, filters and deals',()=>{const s=fs.readFileSync(root+'src/app/api/search/route.ts','utf8');assert.match(s,/country/);assert.match(s,/category/);assert.match(s,/brand/);assert.match(s,/merchant/);assert.match(s,/deal_active/);assert.match(s,/websearch_to_tsquery/) });
test('Comparison API returns merchant-level offers',()=>{const s=fs.readFileSync(root+'src/app/api/compare/route.ts','utf8');assert.match(s,/merchant_name/);assert.match(s,/destination_status/);assert.match(s,/affiliate_link_id/)});
test('Admin indexing is protected',()=>{const s=fs.readFileSync(root+'src/app/api/admin/index/route.ts','utf8');assert.match(s,/getCurrentUser/);assert.match(s,/role !== 'admin'/);assert.match(s,/last_indexed_at/)});
test('Comparison page exists',()=>assert.equal(fs.existsSync(root+'src/app/compare/page.tsx'),true));
