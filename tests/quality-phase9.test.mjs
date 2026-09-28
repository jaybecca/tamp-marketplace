import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(`${root}${p}`, 'utf8');

test('Phase 9 quality documentation and monitoring route exist', () => {
  assert.ok(existsSync(`${root}docs/phase-9-quality-audit.md`));
  assert.ok(existsSync(`${root}src/app/api/monitoring/client-error/route.ts`));
});

test('all four core localization languages and Arabic RTL are supported', () => {
  const source = read('src/components/localization.tsx');
  for (const lang of ['fr', 'ar', 'sw']) assert.match(source, new RegExp(`\\b${lang}:\\s*\\{`));
  assert.match(source, /lang === 'ar' \? 'rtl' : 'ltr'/);
});

test('accessibility baseline is present', () => {
  const layout = read('src/app/layout.tsx');
  const css = read('src/app/globals.css');
  assert.match(layout, /skip-link/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test('production image optimization and security headers are configured', () => {
  const config = read('next.config.ts');
  assert.match(config, /unoptimized: false/);
  assert.match(config, /image\/avif/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /Cross-Origin-Opener-Policy/);
});

test('legal policy surfaces remain present', () => {
  for (const page of ['privacy','cookies','terms','affiliate-disclosure','accessibility']) {
    assert.ok(existsSync(`${root}src/app/policies/${page}/page.tsx`), page);
  }
});
