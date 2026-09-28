import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const root=new URL('../',import.meta.url).pathname;
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('Phase 7 schema has deals content and audit log',()=>{const s=read('../database/migrations/007_admin_operations.sql');for(const t of ['deals','content_items','admin_audit_log'])assert.match(s,new RegExp(`CREATE TABLE IF NOT EXISTS ${t}`));});
test('admin user management route exists and requires admin',()=>{const s=read('../src/app/api/admin/users/route.ts');assert.match(s,/requireAdmin/);assert.match(s,/UPDATE users/);});
test('deals and content management routes exist',()=>{assert.match(read('../src/app/api/admin/deals/route.ts'),/requireAdmin/);assert.match(read('../src/app/api/admin/content/route.ts'),/content_items/);});
test('affiliate analytics route aggregates clicks conversions and commission',()=>{const s=read('../src/app/api/admin/analytics/route.ts');assert.match(s,/affiliate_clicks/);assert.match(s,/affiliate_conversions/);assert.match(s,/commission/);});
test('admin dashboard exposes business operations',()=>{const s=read('../src/app/admin/page.tsx');for(const x of ['Affiliate clicks','Users','Deals','Content','Merchant affiliate performance'])assert.match(s,new RegExp(x));});
