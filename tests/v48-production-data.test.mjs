import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('v48 removes customer-facing static marketplace imports',()=>{
  for (const p of ['src/app/categories/page.tsx','src/app/categories/[slug]/page.tsx','src/app/destinations/page.tsx','src/app/compare/page.tsx','src/components/shopping.tsx']) {
    const s=read('../'+p); assert.equal(s.includes("from '@/data/marketplace'") && !s.includes('import type'),false,`${p} still imports marketplace data`);
  }
});
test('v48 sitemap reads blog slugs from PostgreSQL',()=>{const s=read('../src/app/sitemap.ts');assert.match(s,/FROM blog_posts WHERE active=TRUE/);assert.doesNotMatch(s,/from ['"]@\/data\/blog['"]/);});
test('v48 requires tracking hash salt',()=>{const s=read('../src/server/affiliate/tracking.ts');assert.match(s,/if \(!salt\) throw new Error\('TRACKING_HASH_SALT is not configured'\)/);assert.doesNotMatch(s,/tamp-marketplace-tracking/);});
test('v48 documents production secrets and Docker env exception',()=>{const env=read('../.env.example');for(const key of ['TRACKING_HASH_SALT','INTEGRATION_CREDENTIAL_KEY','ADMIN_EMAILS','AFFILIATE_FEED_API_KEY']) assert.match(env,new RegExp(`^${key}=`,`m`));const d=read('../.dockerignore');assert.match(d,/\.env(?:$|\.local)/);assert.match(d,/\.env\.example/);assert.doesNotMatch(d,/!\.env\.example/);});
test('v48 has database metadata migration for blog and marketplace presentation data',()=>{const s=read('../database/migrations/015_production_catalog_metadata.sql');for(const x of ['blog_posts','region','flag_emoji','currency_symbol','merchant_type']) assert.match(s,new RegExp(x));});
