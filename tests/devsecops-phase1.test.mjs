import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Phase 1 has Docker and Redis infrastructure", () => {
  assert.match(read("docker-compose.yml"), /postgres:|redis:/);
  assert.match(read("Dockerfile"), /npm run build/);
  assert.match(read("src/server/db/redis.ts"), /REDIS_URL/);
});

test("Phase 1 has DevSecOps security workflows", () => {
  assert.match(read(".github/workflows/codeql.yml"), /codeql-action/);
  assert.match(read(".github/workflows/dependency-review.yml"), /dependency-review-action/);
  assert.match(read("package.json"), /security:audit/);
});

test("Phase 1 documents branch protection and secrets", () => {
  const docs = read("docs/phase-1-devsecops.md");
  assert.match(docs, /Branch protection/);
  assert.match(docs, /Secrets/);
});
