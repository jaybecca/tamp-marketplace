import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "src/server/db/types.ts",
  "src/server/db/client.ts",
  "src/server/lib/env.ts",
  "src/server/lib/errors.ts",
  "src/app/api/health/route.ts",
  "src/app/error.tsx",
  "src/app/global-error.tsx",
  "database/migrations/001_initial.sql",
  ".env.example",
  ".github/workflows/ci.yml",
];

const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  console.error("Missing foundation files:\n" + missing.join("\n"));
  process.exit(1);
}

const migration = readFileSync(resolve(root, "database/migrations/001_initial.sql"), "utf8");
for (const table of ["countries", "merchants", "merchant_country_availability", "products", "merchant_products", "product_country_availability", "affiliate_links"]) {
  if (!migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    throw new Error(`Missing database table definition: ${table}`);
  }
}

console.log("TAMP Marketplace Phase 1 foundation checks passed.");
