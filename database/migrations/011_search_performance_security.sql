-- TAMP Marketplace — Phase 5 production search, discovery and comparison hardening
-- Search must only surface merchants/products configured for the requested destination.

CREATE INDEX IF NOT EXISTS idx_merchant_country_active_status
  ON merchant_country_availability(country_code, status, merchant_id);

CREATE INDEX IF NOT EXISTS idx_product_country_destination_status
  ON product_country_availability(country_code, status, merchant_product_id);

CREATE INDEX IF NOT EXISTS idx_merchant_products_product_price
  ON merchant_products(product_id, price, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_destination_active_dates
  ON deals(country_code, active, starts_at, ends_at, merchant_product_id);

CREATE INDEX IF NOT EXISTS idx_products_active_updated
  ON products(active, updated_at DESC);

-- The Phase 3 hardening migration referenced a non-existent brand_slug column.
-- Use the canonical products.brand column instead.
DROP INDEX IF EXISTS idx_products_brand_active;
CREATE INDEX IF NOT EXISTS idx_products_brand_active
  ON products(brand, active);

-- Protect search from unbounded pagination and invalid sort values at the database layer.
ALTER TABLE merchant_products DROP CONSTRAINT IF EXISTS merchant_products_price_nonnegative;
ALTER TABLE merchant_products ADD CONSTRAINT merchant_products_price_nonnegative CHECK (price IS NULL OR price >= 0);

CREATE OR REPLACE VIEW active_destination_deals AS
SELECT
  d.id AS deal_id,
  d.title,
  d.description,
  d.discount_percent,
  d.starts_at,
  d.ends_at,
  d.country_code,
  p.slug AS product_slug,
  p.title AS product_title,
  m.slug AS merchant_slug,
  m.name AS merchant_name,
  mp.id AS merchant_product_id,
  mp.price,
  mp.old_price,
  mp.currency_code
FROM deals d
JOIN merchant_products mp ON mp.id = d.merchant_product_id
JOIN products p ON p.id = mp.product_id AND p.active = TRUE
JOIN merchants m ON m.id = mp.merchant_id AND m.active = TRUE
JOIN merchant_country_availability mca
  ON mca.merchant_id = m.id
 AND mca.country_code = COALESCE(d.country_code, 'NG')
 AND mca.status IN ('available','limited','product-dependent')
WHERE d.active = TRUE
  AND d.starts_at <= NOW()
  AND (d.ends_at IS NULL OR d.ends_at >= NOW());
