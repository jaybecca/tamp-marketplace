import type { DatabaseAdapter, DatabaseHealth } from "./types";

/**
 * Database boundary for TAMP Marketplace.
 *
 * Phase 1 intentionally keeps the adapter dependency-free. The PostgreSQL
 * schema and migration are ready in /database; Phase 2+ can attach the
 * production driver without coupling the UI to a specific ORM.
 */
class Database implements DatabaseAdapter {
  async health(): Promise<DatabaseHealth> {
    return process.env.DATABASE_URL
      ? { configured: true, provider: "postgresql" }
      : { configured: false, provider: "unconfigured" };
  }
}

export const db = new Database();
