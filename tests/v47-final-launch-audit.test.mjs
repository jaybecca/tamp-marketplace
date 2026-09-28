import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');

test('v47: all 50 blog posts have six-language stored coverage', () => {
  const blog = read('src/data/blog.ts');
  const locales = read('src/data/blog-locales.ts');
  const slugs = [...blog.matchAll(/slug:'([^']+)'/g)].map(m=>m[1]);
  assert.equal(slugs.length, 50);
  for (const lang of ['fr','pt','ar','sw','zu']) {
    const start = locales.indexOf(`  ${lang}: {`);
    const nextLangs = ['fr','pt','ar','sw','zu'].filter(x => x !== lang).map(x => locales.indexOf(`  ${x}: {`, start + 1)).filter(x => x >= 0);
    const end = nextLangs.length ? Math.min(...nextLangs) : locales.lastIndexOf('\n};');
    const section = locales.slice(start, end < 0 ? locales.length : end);
    for (const slug of slugs) assert.match(section, new RegExp(`'${slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}':`));
  }
});

test('v47: blog index and article pages use localized stored content', () => {
  assert.match(read('src/app/blog/page.tsx'), /LocalizedBlogList/);
  assert.match(read('src/app/blog/[slug]/page.tsx'), /LocalizedBlogArticle/);
  assert.doesNotMatch(read('src/components/blog-localized.tsx'), /fetch\(|gemini|GEMINI/i);
});

test('v47: authenticated profile dropdown exposes account functionality', () => {
  const site = read('src/components/site.tsx');
  for (const item of ['/account','/wishlist','/settings','/api/auth/sign-out']) assert.match(site, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(site, /account-menu/);
});

test('v47: auth and public sensitive endpoints are rate limited', () => {
  for (const file of ['src/app/api/auth/sign-in/route.ts','src/app/api/auth/register/route.ts','src/app/api/auth/google/start/route.ts','src/app/api/affiliate/route.ts','src/app/api/content/translate/route.ts','src/app/api/monitoring/client-error/route.ts']) {
    assert.match(read(file), /rateLimit\(/, file);
  }
});

test('v47: Sentry is integrated without enabling PII by default', () => {
  assert.match(read('package.json'), /@sentry\/nextjs/);
  assert.match(read('next.config.ts'), /withSentryConfig/);
  assert.match(read('sentry.client.config.ts'), /sendDefaultPii: false/);
  assert.match(read('sentry.server.config.ts'), /sendDefaultPii: false/);
  assert.match(read('instrumentation.ts'), /sentry.server.config/);
});

test('v47: Arabic document direction is set by the localization layer and styled globally', () => {
  assert.match(read('src/components/localization.tsx'), /document\.documentElement\.dir = lang === 'ar' \? 'rtl' : 'ltr'/);
  const css = read('src/app/globals.css');
  assert.match(css, /html\[dir="rtl"\] body/);
  assert.match(css, /html\[dir="rtl"\] \.account-menu-panel/);
  assert.match(css, /html\[dir="rtl"\] \.footer-main/);
});

test('v47: production SEO sitemap is database driven', () => {
  const sitemap = read('src/app/sitemap.ts');
  assert.match(sitemap, /FROM products WHERE active=TRUE/);
  assert.match(sitemap, /FROM categories WHERE active=TRUE/);
  assert.match(sitemap, /FROM merchants WHERE active=TRUE/);
});
