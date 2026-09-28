import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;

test('v51 uses TAMP as ecosystem brand and Marketplace as service', () => {
  const page = fs.readFileSync(`${root}/src/app/page.tsx`, 'utf8');
  assert.match(page, /TAMP Marketplace is a shopping discovery and comparison service/);
  assert.doesNotMatch(page, /TAMP helps you choose where to shop/);
});

test('v51 blog index contains complete 50-guide positioning copy', () => {
  const page = fs.readFileSync(`${root}/src/app/blog/page.tsx`, 'utf8');
  assert.match(page, /50 practical, funny and useful guides for comparing products, prices, merchants and destinations across Africa and beyond/);
});

test('v51 policy pages preserve marketplace boundary language', () => {
  for (const name of ['privacy','terms','affiliate-disclosure','accessibility','cookies']) {
    const p = fs.readFileSync(`${root}/src/app/policies/${name}/page.tsx`, 'utf8');
    assert.match(p, /TAMP Marketplace|TAMP, the ecosystem brand/);
  }
});

test('v51 removes footer English/USD control', () => {
  const page = fs.readFileSync(`${root}/src/app/page.tsx`, 'utf8');
  assert.doesNotMatch(page, /English · USD/);
});
