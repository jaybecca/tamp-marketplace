import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const loc=fs.readFileSync('src/components/localization.tsx','utf8');
const blog=fs.readFileSync('src/components/blog-localized.tsx','utf8');
const rtl=fs.readFileSync('src/app/globals.css','utf8');
test('v45 removes per-user Gemini translation from normal rendering',()=>{
  assert.equal(blog.includes('/api/content/translate'),false);
  assert.equal(loc.includes("fetch('/api/content/translate'"),false);
  assert.equal(loc.includes('async function translateResiduals'),false);
});
test('v45 blog locales are stored locally for all five translated languages',()=>{
  const s=fs.readFileSync('src/data/blog-locales.ts','utf8');
  for(const lang of ['fr','pt','sw','zu','ar']) assert.ok(new RegExp(`\\n\\s*${lang}: \\{`).test(s));
  assert.ok((s.match(/content:\[/g)||[]).length>=50*5);
});
test('v45 has RTL layout rules beyond the document direction',()=>{
  for(const token of ['html[dir="rtl"] body','html[dir="rtl"] .header','html[dir="rtl"] .search input','html[dir="rtl"] .account-menu-panel','html[dir="rtl"] .footer-main']) assert.match(rtl,new RegExp(token.replace(/[.[\]]/g,'\\$&')));
});
