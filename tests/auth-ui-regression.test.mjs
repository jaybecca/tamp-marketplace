import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const header = fs.readFileSync('src/components/site.tsx','utf8');
const signIn = fs.readFileSync('src/app/auth/sign-in/page.tsx','utf8');
const register = fs.readFileSync('src/app/auth/register/page.tsx','utf8');
const google = fs.readFileSync('src/app/api/auth/google/callback/route.ts','utf8');

test('authenticated header reads the server session', () => {
  assert.match(header, /import \{ getCurrentUser \} from '@\/lib\/auth'/);
  assert.match(header, /const user = await getCurrentUser\(\)/);
  assert.match(header, /href="\/account"/);
});

test('email authentication redirects to the account area', () => {
  assert.match(signIn, /router\.replace\('\/account'\)/);
  assert.match(register, /router\.replace\('\/account'\)/);
});

test('Google authentication redirects to the account area', () => {
  assert.match(google, /new URL\('\/account',request\.url\)/);
});
