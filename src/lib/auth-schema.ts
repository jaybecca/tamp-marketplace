import { query } from './db';

export async function ensureAuthSchema() {
  await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  await query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    password_hash TEXT, avatar_url TEXT, provider TEXT NOT NULL DEFAULT 'email', provider_account_id TEXT,
    consent_version TEXT, consent_at TIMESTAMPTZ, active BOOLEAN NOT NULL DEFAULT TRUE,
    country_code CHAR(2), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code CHAR(2)`);
  await query(`CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await query(`CREATE TABLE IF NOT EXISTS privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_version TEXT NOT NULL, essential BOOLEAN NOT NULL DEFAULT TRUE, analytics BOOLEAN NOT NULL DEFAULT FALSE,
    marketing BOOLEAN NOT NULL DEFAULT FALSE, source TEXT NOT NULL DEFAULT 'account', consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await query(`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_country ON users(country_code)`);
}
