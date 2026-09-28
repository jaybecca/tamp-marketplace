import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=process.cwd()+'/';
test('v44 upgrades Next.js security patch',()=>{const p=JSON.parse(fs.readFileSync(root+'package.json','utf8'));assert.equal(p.dependencies.next,'16.3.6');assert.equal(p.devDependencies['eslint-config-next'],'16.3.6');});
test('v44 adds Redis-backed rate limiting and translation fallback',()=>{assert.ok(fs.existsSync(root+'src/server/security-rate-limit.ts'));const t=fs.readFileSync(root+'src/app/api/content/translate/route.ts','utf8');assert.match(t,/rateLimit/);assert.match(t,/texts/);});
test('v44 catalog seed exists and affiliate links are inactive until credentials are configured',()=>{const s=fs.readFileSync(root+'database/migrations/014_catalog_seed.sql','utf8');assert.match(s,/INSERT INTO products/);assert.match(s,/INSERT INTO merchant_products/);assert.match(s,/active\)\s*\nSELECT mp.id/);assert.match(s,/FALSE/);});
