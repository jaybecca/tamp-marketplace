-- TAMP Marketplace — Phase 4 merchant data & integration engine hardening
ALTER TABLE merchant_feed_configs
  ADD COLUMN IF NOT EXISTS credential_ciphertext TEXT,
  ADD COLUMN IF NOT EXISTS credential_last4 TEXT,
  ADD COLUMN IF NOT EXISTS adapter_key TEXT,
  ADD COLUMN IF NOT EXISTS next_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS records_imported INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS records_rejected INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS merchant_feed_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_config_id UUID NOT NULL REFERENCES merchant_feed_configs(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','rejected')),
  error_message TEXT,
  UNIQUE(feed_config_id, external_id)
);

CREATE TABLE IF NOT EXISTS product_source_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  source_sku TEXT NOT NULL,
  normalized_key TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(merchant_id, normalized_key)
);

CREATE TABLE IF NOT EXISTS integration_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  feed_config_id UUID REFERENCES merchant_feed_configs(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_imported INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_records_status ON merchant_feed_records(feed_config_id,status,received_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_records_fingerprint ON merchant_feed_records(fingerprint);
CREATE INDEX IF NOT EXISTS idx_source_keys_product ON product_source_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_integration_audit_merchant ON integration_audit_log(merchant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_next_sync ON merchant_feed_configs(active,next_sync_at);
