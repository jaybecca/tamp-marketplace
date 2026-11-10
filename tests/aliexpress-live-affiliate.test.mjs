import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('AliExpress affiliate adapter uses the live TOP gateway and approved affiliate methods', () => {
  const source = read('src/server/affiliate/aliexpress-api.ts');
  assert.match(source, /https:\/\/eco\.taobao\.com\/router\/rest/);
  assert.match(source, /aliexpress\.affiliate\.product\.query/);
  assert.match(source, /aliexpress\.affiliate\.link\.generate/);
  assert.match(source, /ALIEXPRESS_TRACKING_ID/);
  assert.doesNotMatch(source, /sandbox|api-sg\.aliexpress\.com\/rest/);
});

test('AliExpress affiliate endpoints are rate limited and server-only', () => {
  const search = read('src/app/api/affiliate/aliexpress/search/route.ts');
  const link = read('src/app/api/affiliate/aliexpress/link/route.ts');
  assert.match(search, /rateLimit/);
  assert.match(link, /rateLimit/);
  assert.match(search, /searchAliExpressAffiliateProducts/);
  assert.match(link, /generateAliExpressPromotionLink/);
});
