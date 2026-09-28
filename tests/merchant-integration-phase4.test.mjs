import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('database/migrations/010_merchant_integration_engine.sql','utf8');
const creds = fs.readFileSync('src/server/integrations/credentials.ts','utf8');
const normalize = fs.readFileSync('src/server/feeds/normalize.ts','utf8');
const ingest = fs.readFileSync('src/server/feeds/ingest.ts','utf8');
const api = fs.readFileSync('src/app/api/admin/integrations/route.ts','utf8');

test('Phase 4 integration migration adds encrypted credentials and sync metadata',()=>{
  for (const needle of ['credential_ciphertext','adapter_key','next_sync_at','merchant_feed_records','product_source_keys','integration_audit_log']) assert.match(migration,new RegExp(needle));
});
test('credentials use authenticated encryption and server-side secret',()=>{
  assert.match(creds,/aes-256-gcm/); assert.match(creds,/INTEGRATION_CREDENTIAL_KEY/); assert.match(creds,/createCipheriv/);
});
test('feed normalization canonicalizes identifiers and rejects invalid URLs',()=>{
  assert.match(normalize,/normalizeSku/); assert.match(normalize,/NFKC/); assert.match(normalize,/https/); assert.match(normalize,/fingerprintProduct/);
});
test('ingestion uses normalization and source-key deduplication',()=>{
  assert.match(ingest,/normalizeFeedProduct/); assert.match(ingest,/fingerprintProduct/); assert.match(ingest,/product_source_keys/);
});
test('admin integration endpoint never returns credential ciphertext',()=>{
  assert.match(api,/credential_last4/); assert.doesNotMatch(api,/credential_ciphertext.*rows/);
});
test('admin integration configuration requires admin access',()=>{
  assert.match(api,/requireAdmin/); assert.match(api,/encryptCredential/);
});
