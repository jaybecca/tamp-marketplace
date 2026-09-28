-- TAMP Marketplace — Phase 7 affiliate & revenue engine hardening
CREATE TABLE IF NOT EXISTS affiliate_network_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES affiliate_networks(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  account_name TEXT NOT NULL,
  publisher_id TEXT,
  credential_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(merchant_id,country_code,affiliate_link_id)
);

CREATE TABLE IF NOT EXISTS affiliate_commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id UUID NOT NULL REFERENCES affiliate_conversions(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  network_name TEXT,
  external_transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','reversed','rejected')),
  commission_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency_code CHAR(3),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversion_id,status)
);

CREATE TABLE IF NOT EXISTS affiliate_fraud_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_hash TEXT,
  session_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_routes_country ON affiliate_routing_rules(merchant_id,country_code,priority) WHERE active;
CREATE INDEX IF NOT EXISTS idx_affiliate_ledger_merchant ON affiliate_commission_ledger(merchant_id,recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_ledger_currency ON affiliate_commission_ledger(currency_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_fraud_ip ON affiliate_fraud_events(ip_hash,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_accounts_network ON affiliate_network_accounts(network_id,status);

ALTER TABLE affiliate_conversions ADD COLUMN IF NOT EXISTS attribution_window_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE affiliate_conversions ADD COLUMN IF NOT EXISTS attributed_click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL;
ALTER TABLE affiliate_conversions ADD COLUMN IF NOT EXISTS fraud_review BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_affiliate_conversion_transaction ON affiliate_conversions(external_transaction_id) WHERE external_transaction_id IS NOT NULL;
