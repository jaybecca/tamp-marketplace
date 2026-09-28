import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('Phase 6 migration contains currency rates and price history', () => {
  const sql = read('../database/migrations/006_pricing_availability.sql');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS currency_rates/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS price_history/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS sync_runs/);
});

test('Phase 6 tracks stock and destination shipping data', () => {
  const sql = read('../database/migrations/006_pricing_availability.sql');
  assert.match(sql, /stock_status/);
  assert.match(sql, /shipping_status/);
  assert.match(sql, /estimated_min_days/);
  assert.match(sql, /data_fresh_until/);
});

test('Feed ingestion records real source pricing and freshness fields', () => {
  const src = read('../src/server/feeds/ingest.ts');
  assert.match(src, /price_history/);
  assert.match(src, /price_updated_at/);
  assert.match(src, /data_fresh_until/);
  assert.match(src, /stock_status/);
});

test('Currency rates API and availability API exist', () => {
  assert.ok(fs.existsSync(new URL('../src/app/api/pricing/rates/route.ts', import.meta.url)));
  assert.ok(fs.existsSync(new URL('../src/app/api/products/[slug]/availability/route.ts', import.meta.url)));
});

test('Merchant feed synchronization is admin protected', () => {
  const src = read('../src/app/api/merchant-feeds/sync/route.ts');
  assert.match(src, /requireAdmin/);
});
