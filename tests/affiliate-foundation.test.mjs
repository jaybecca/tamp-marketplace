import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('Phase 4 affiliate migration includes networks, feeds, clicks and conversions', () => {
  const sql = read('database/migrations/004_affiliate_integrations.sql');
  for (const name of ['affiliate_networks','merchant_feed_configs','affiliate_clicks','affiliate_conversions','merchant_verifications']) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${name}`));
  assert.match(sql, /verification_status/);
  assert.match(sql, /network_link_id/);
});

test('affiliate redirect records a click before redirecting', () => {
  const route = read('src/app/api/go/[id]/route.ts');
  assert.match(route, /recordAffiliateClick/);
  assert.match(route, /NextResponse\.redirect/);
});

test('external feed ingestion requires bearer authorization', () => {
  const route = read('src/app/api/feeds/[merchant]/route.ts');
  assert.match(route, /AFFILIATE_FEED_API_KEY/);
  assert.match(route, /authorization/);
  assert.match(route, /upsertFeedProducts/);
});

test('admin conversion and merchant verification endpoints are protected', () => {
  assert.match(read('src/app/api/admin/conversions/route.ts'), /requireAdmin/);
  assert.match(read('src/app/api/admin/verification/route.ts'), /requireAdmin/);
});

test('tracking hashes IP values rather than storing raw IPs', () => {
  const source = read('src/server/affiliate/tracking.ts');
  assert.match(source, /createHash\('sha256'\)/);
  assert.match(source, /ip_hash/);
});
