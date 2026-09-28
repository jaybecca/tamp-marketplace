import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('phase 2 auth schema exists',()=>{const s=read('database/migrations/002_auth.sql');for(const x of ['users','auth_sessions','saved_products','privacy_consents'])assert.match(s,new RegExp(`CREATE TABLE IF NOT EXISTS ${x}`));});
test('email auth and Google OAuth routes exist',()=>{assert.ok(fs.existsSync('src/app/api/auth/register/route.ts'));assert.ok(fs.existsSync('src/app/api/auth/sign-in/route.ts'));assert.ok(fs.existsSync('src/app/api/auth/google/start/route.ts'));assert.ok(fs.existsSync('src/app/api/auth/google/callback/route.ts'));});
test('session cookie is HttpOnly and same-site',()=>{const s=read('src/lib/auth.ts');assert.match(s,/httpOnly: true/);assert.match(s,/sameSite: 'lax'/);});
test('registration requires privacy consent',()=>{const s=read('src/app/api/auth/register/route.ts');assert.match(s,/consent === true/);});
test('saved products API requires authentication',()=>{const s=read('src/app/api/wishlist/route.ts');assert.match(s,/Authentication required/);});
