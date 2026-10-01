-- TAMP Marketplace v53 — AliExpress seller OAuth credentials
CREATE TABLE IF NOT EXISTS aliexpress_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id TEXT NOT NULL UNIQUE,
  access_token_ciphertext TEXT NOT NULL,
  refresh_token_ciphertext TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked','error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aliexpress_auth_status ON aliexpress_authorizations(status,updated_at DESC);
