import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
test('Phase 10 launch operations migration exists',()=>assert.ok(fs.existsSync(`${root}database/migrations/008_launch_operations.sql`)));
test('Phase 10 support workflow endpoint exists',()=>assert.ok(fs.existsSync(`${root}src/app/api/support/tickets/route.ts`)));
test('Phase 10 admin launch checklist is protected',()=>{const s=fs.readFileSync(`${root}src/app/api/admin/launch/route.ts`,'utf8');assert.match(s,/requireAdmin/);assert.match(s,/launch_checks/);});
test('Phase 10 production configuration is documented',()=>{const s=fs.readFileSync(`${root}.env.example`,'utf8');assert.match(s,/NEXT_PUBLIC_SUPPORT_WHATSAPP/);assert.match(s,/SENTRY_DSN/);});
test('Phase 10 launch runbook exists',()=>assert.ok(fs.existsSync(`${root}docs/phase-10-launch-readiness.md`)&&fs.existsSync(`${root}docs/launch-operations.md`)));
