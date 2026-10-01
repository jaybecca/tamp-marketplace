import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
test('v49 auth client pages do not import server-aware site module',()=>{
  for (const p of ['src/app/auth/sign-in/page.tsx','src/app/auth/register/page.tsx']) {
    const s=read(p); assert.doesNotMatch(s,/@\/components\/site/); assert.match(s,/@\/components\/auth-shell/);
  }
});
test('v49 auth shell is free of database/auth server imports',()=>{
  const s=read('src/components/auth-shell.tsx'); assert.doesNotMatch(s,/@\/lib\/(auth|db)/); assert.doesNotMatch(s,/@\/components\/site/);
});
