-- TAMP Marketplace — Phase 6 pricing, currency and availability intelligence

CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency CHAR(3) NOT NULL,
  quote_currency CHAR(3) NOT NULL,
  rate NUMERIC(24,10) NOT NULL CHECK (rate > 0),
  source TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(base_currency, quote_currency, source, observed_at)
);

CREATE INDEX IF NOT EXISTS idx_currency_rates_pair ON currency_rates(base_currency, quote_currency, observed_at DESC);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_product_id UUID NOT NULL REFERENCES merchant_products(id) ON DELETE CASCADE,
  price NUMERIC(18,2) NOT NULL CHECK (price >= 0),
  currency_code CHAR(3) NOT NULL,
  old_price NUMERIC(18,2),
  stock_status TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(merchant_product_id, observed_at DESC);

ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS stock_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (stock_status IN ('in-stock','low-stock','out-of-stock','preorder','unknown'));
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS price_source TEXT;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS availability_checked_at TIMESTAMPTZ;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS data_fresh_until TIMESTAMPTZ;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ;

ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (shipping_status IN ('available','limited','unavailable','unknown'));
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(18,2);
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS shipping_currency CHAR(3);
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS estimated_min_days INTEGER;
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS estimated_max_days INTEGER;
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS customs_note TEXT;
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;
ALTER TABLE product_country_availability ADD COLUMN IF NOT EXISTS data_fresh_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('currency','merchant-feed','availability','pricing')),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('running','completed','partial','failed')),
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
CREATE INDEX IF NOT EXISTS idx_sync_runs_type ON sync_runs(sync_type, started_at DESC);

CREATE OR REPLACE VIEW marketplace_pricing_availability AS
SELECT
  p.id AS product_id, p.slug, p.title,
  mp.id AS merchant_product_id, m.id AS merchant_id, m.name AS merchant_name,
  mp.price, mp.currency_code, mp.old_price, mp.stock_status, mp.stock_quantity,
  mp.price_updated_at, mp.availability_checked_at, mp.data_fresh_until,
  pca.country_code, pca.status AS destination_status,
  pca.shipping_status, pca.shipping_method, pca.shipping_cost, pca.shipping_currency,
  pca.estimated_min_days, pca.estimated_max_days, pca.customs_note,
  pca.last_checked_at AS destination_checked_at, pca.data_fresh_until AS destination_fresh_until
FROM products p
JOIN merchant_products mp ON mp.product_id = p.id
JOIN merchants m ON m.id = mp.merchant_id AND m.active = TRUE
LEFT JOIN product_country_availability pca ON pca.merchant_product_id = mp.id
WHERE p.active = TRUE;
