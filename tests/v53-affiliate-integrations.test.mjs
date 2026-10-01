import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
test('v53 environment and affiliate integration foundation exists',()=>{
  const env=read('.env.example');
  for(const key of ['JUMIA_AFFILIATE_LINK','JUMIA_AFFILIATE_SECRET','ALIEXPRESS_APP_KEY','ALIEXPRESS_APP_SECRET','ALIEXPRESS_CALLBACK_URL']) assert.match(env,new RegExp(`^${key}=`,'m'));
  assert.match(read('src/app/api/admin/affiliate/configure/route.ts'),/JUMIA_AFFILIATE_LINK/);
  assert.match(read('src/app/api/admin/aliexpress/start/route.ts'),/buildAuthorizationUrl/);
  assert.match(read('src/app/api/admin/aliexpress/callback/route.ts'),/exchangeAliExpressCode/);
  assert.match(read('database/migrations/017_aliexpress_oauth.sql'),/access_token_ciphertext/);
});
test('v53 project excludes local secrets from release archive',()=>{
  assert.match(read('.gitignore'),/\.env\.local/);
  assert.match(read('.dockerignore'),/\.env\.local/);
});
