import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, 'database/migrations/009_marketplace_core_hardening.sql'), 'utf8');

test('Phase 3 migration hardens core marketplace relationships', () => {
  assert.match(migration, /uq_merchant_products_canonical_source/);
  assert.match(migration, /admin_catalog_summary/);
  assert.match(migration, /products_slug_format/);
});

test('Phase 3 seeds Africa-wide country coverage', () => {
  for (const code of ['NG','ZA','KE','EG','MA','GH','DZ','AO','MZ','SN','CI','UG']) {
    assert.match(migration, new RegExp(`\\('${code}',`));
  }
});

test('Phase 3 keeps destination availability separate from merchant availability', () => {
  assert.match(migration, /merchant_products/);
  assert.match(migration, /product_country_availability/);
  assert.match(migration, /merchant_country_availability/);
});

test('Admin catalog endpoint is protected and queryable', () => {
  const file = fs.readFileSync(path.join(root, 'src/app/api/admin/catalog/route.ts'), 'utf8');
  assert.match(file, /requireAdmin/);
  assert.match(file, /admin_catalog_summary/);
  assert.match(file, /searchParams/);
});
