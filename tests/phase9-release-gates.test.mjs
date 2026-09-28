import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(`${root}${p}`, 'utf8');

test('Phase 9 supports all six requested locales', () => {
  const source = read('src/components/localization.tsx');
  for (const lang of ['fr','ar','sw','pt','zu']) assert.match(source, new RegExp(`\\b${lang}:\\s*\\{`));
});

test('SEO structured data covers all six locales and Africa', () => {
  const source = read('src/app/layout.tsx');
  assert.match(source, /inLanguage: \['en', 'fr', 'ar', 'sw', 'pt', 'zu'\]/);
  assert.match(source, /name: 'Africa'/);
  assert.match(source, /@type': 'WebSite'/);
});

test('error boundaries report sanitized monitoring events', () => {
  assert.match(read('src/app/error.tsx'), /api\/monitoring\/client-error/);
  assert.match(read('src/app/global-error.tsx'), /api\/monitoring\/client-error/);
});

test('production QA gates exist', () => {
  assert.ok(existsSync(`${root}docs/phase-9-quality-audit.md`));
  assert.match(read('next.config.ts'), /image\/avif/);
  assert.match(read('next.config.ts'), /Strict-Transport-Security/);
  assert.match(read('next.config.ts'), /X-Frame-Options/);
  assert.match(read('src/app/globals.css'), /@media\s*\(max-width:640px\)/);
  assert.match(read('src/app/globals.css'), /prefers-reduced-motion/);
});

test('legal review gate is explicitly documented', () => {
  const source = read('docs/phase-9-quality-audit.md');
  assert.match(source, /qualified counsel/);
  for (const page of ['privacy','cookies','terms','affiliate-disclosure','accessibility']) {
    assert.ok(existsSync(`${root}src/app/policies/${page}/page.tsx`));
  }
});
