-- TAMP Marketplace — Phase 4 affiliate + merchant integration layer
CREATE TABLE IF NOT EXISTS affiliate_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  base_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS affiliate_network_id UUID REFERENCES affiliate_networks(id) ON DELETE SET NULL;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','pending','verified','rejected'));
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS verification_source TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS verification_notes TEXT;

CREATE TABLE IF NOT EXISTS merchant_feed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  feed_type TEXT NOT NULL CHECK (feed_type IN ('api','csv','xml','json','affiliate-network')),
  feed_url TEXT,
  credential_ref TEXT,
  schedule TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_links ADD COLUMN IF NOT EXISTS network_link_id TEXT;
ALTER TABLE affiliate_links ADD COLUMN IF NOT EXISTS tracking_code TEXT;
ALTER TABLE affiliate_links ADD COLUMN IF NOT EXISTS deep_link_template TEXT;
ALTER TABLE affiliate_links ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  country_code CHAR(2) REFERENCES countries(code) ON DELETE SET NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  network_name TEXT,
  external_order_id TEXT,
  external_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','reversed','rejected')),
  order_value NUMERIC(18,2),
  commission_amount NUMERIC(18,2),
  currency_code CHAR(3),
  occurred_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB
);

CREATE TABLE IF NOT EXISTS merchant_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','verified','rejected')),
  source TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_active ON affiliate_links(active);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link ON affiliate_clicks(affiliate_link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_country ON affiliate_clicks(country_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_merchant ON affiliate_conversions(merchant_id, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_external ON affiliate_conversions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_merchant_feed_configs_merchant ON merchant_feed_configs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_verifications_merchant ON merchant_verifications(merchant_id, checked_at DESC);

INSERT INTO affiliate_networks(name,slug,base_url) VALUES
('Direct merchant','direct',NULL),
('Amazon Associates','amazon-associates','https://affiliate-program.amazon.com/'),
('JUMIA Affiliate','jumia-affiliate','https://affiliate.jumia.com/'),
('AliExpress Portals','aliexpress-portals','https://portals.aliexpress.com/'),
('eBay Partner Network','ebay-partner-network','https://partnernetwork.ebay.com/'),
('TEMU Affiliate','temu-affiliate','https://www.temu.com/')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,base_url=EXCLUDED.base_url,updated_at=NOW();

UPDATE merchants m SET affiliate_network_id=n.id
FROM affiliate_networks n
WHERE LOWER(COALESCE(m.affiliate_network,'')) = n.slug
   OR (m.slug='amazon' AND n.slug='amazon-associates')
   OR (m.slug='jumia' AND n.slug='jumia-affiliate')
   OR (m.slug='aliexpress' AND n.slug='aliexpress-portals')
   OR (m.slug='ebay' AND n.slug='ebay-partner-network')
   OR (m.slug='temu' AND n.slug='temu-affiliate');
