-- TAMP Marketplace — Phase 2 users, authentication, saved products and consent
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email' CHECK (provider IN ('email','google')),
  provider_account_id TEXT,
  consent_version TEXT,
  consent_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_account ON users(provider, provider_account_id) WHERE provider_account_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  listed_price NUMERIC(18,2),
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_slug)
);
CREATE INDEX IF NOT EXISTS idx_saved_products_user ON saved_products(user_id);

CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  essential BOOLEAN NOT NULL DEFAULT TRUE,
  analytics BOOLEAN NOT NULL DEFAULT FALSE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'account',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user ON privacy_consents(user_id);
