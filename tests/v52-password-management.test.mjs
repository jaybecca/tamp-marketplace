import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('v52 password management routes and secure token schema exist', () => {
  assert.match(read('src/app/api/auth/forgot-password/route.ts'), /password_reset_tokens/);
  assert.match(read('src/app/api/auth/reset-password/route.ts'), /used_at IS NULL/);
  assert.match(read('src/app/api/auth/change-password/route.ts'), /verifyPassword/);
  assert.match(read('database/migrations/016_password_management.sql'), /expires_at TIMESTAMPTZ/);
  assert.match(read('database/migrations/016_password_management.sql'), /used_at TIMESTAMPTZ/);
});

test('v52 auth UI exposes recovery, change-password and show-hide controls', () => {
  assert.match(read('src/app/auth/sign-in/page.tsx'), /Forgot password/);
  assert.match(read('src/app/auth/forgot-password/page.tsx'), /Send reset link/);
  assert.match(read('src/app/auth/reset-password/page.tsx'), /Confirm new password/);
  assert.match(read('src/app/auth/change-password/page.tsx'), /Current password/);
  assert.match(read('src/components/preferences.tsx'), /password-toggle/);
  assert.match(read('src/app/settings/page.tsx'), /Password management/);
});

test('v52 password recovery has all six locale translations and transactional email configuration', () => {
  const localization = read('src/components/localization.tsx');
  for (const locale of ['fr','pt','ar','sw','zu']) assert.match(localization, new RegExp(`${locale}:`));
  for (const phrase of ['Forgot your password?','Send reset link','Create a new password','Change password']) assert.ok(localization.includes(phrase));
  const env = read('.env.example');
  assert.match(env, /^RESEND_API_KEY=/m);
  assert.match(env, /^RESEND_FROM_EMAIL=/m);
});
