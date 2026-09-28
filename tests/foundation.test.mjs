import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const required = [
  "src/server/db/client.ts",
  "src/server/lib/env.ts",
  "src/app/api/health/route.ts",
  "database/migrations/001_initial.sql",
];

test("Phase 1 foundation files exist", () => {
  for (const file of required) assert.equal(existsSync(file), true, file);
});

test("database migration contains destination-aware affiliate model", () => {
  const sql = readFileSync("database/migrations/001_initial.sql", "utf8");
  for (const table of ["countries", "merchants", "merchant_country_availability", "products", "merchant_products", "product_country_availability", "affiliate_links"]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
});

test("affiliate links never represent checkout ownership", () => {
  const sql = readFileSync("database/migrations/001_initial.sql", "utf8");
  assert.match(sql, /destination_url TEXT NOT NULL/);
  assert.doesNotMatch(sql, /payment_status|order_total|fulfillment_status/);
});
