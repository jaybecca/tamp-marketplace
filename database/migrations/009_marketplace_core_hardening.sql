-- TAMP Marketplace — Phase 3 Marketplace Core hardening
-- Canonical catalog relationships, Africa-wide country coverage, and query performance.

CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_slug, active);
CREATE INDEX IF NOT EXISTS idx_products_brand_active ON products(brand_slug, active);
CREATE INDEX IF NOT EXISTS idx_merchant_products_product_active ON merchant_products(product_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant_updated ON merchant_products(merchant_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_country_status_country ON product_country_availability(country_code, status);
CREATE INDEX IF NOT EXISTS idx_merchant_country_status_country ON merchant_country_availability(country_code, status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_country_active ON affiliate_links(country_code, active);

-- Keep the canonical product/merchant offer relationship deterministic even when source_sku is absent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_merchant_products_canonical_source
  ON merchant_products(product_id, merchant_id, COALESCE(NULLIF(source_sku,''), source_url));

-- All sovereign African markets are represented in the core country registry.
-- Merchant/product availability still controls whether a market is actually served.
INSERT INTO countries(code,name,currency_code,default_language) VALUES
('DZ','Algeria','DZD','ar'),
('AO','Angola','AOA','pt'),
('BJ','Benin','XOF','fr'),
('BW','Botswana','BWP','en'),
('BF','Burkina Faso','XOF','fr'),
('BI','Burundi','BIF','fr'),
('CV','Cabo Verde','CVE','pt'),
('CM','Cameroon','XAF','fr'),
('CF','Central African Republic','XAF','fr'),
('TD','Chad','XAF','fr'),
('KM','Comoros','KMF','fr'),
('CG','Republic of the Congo','XAF','fr'),
('CD','Democratic Republic of the Congo','CDF','fr'),
('CI','Côte d’Ivoire','XOF','fr'),
('DJ','Djibouti','DJF','fr'),
('EG','Egypt','EGP','ar'),
('GQ','Equatorial Guinea','XAF','fr'),
('ER','Eritrea','ERN','ar'),
('SZ','Eswatini','SZL','en'),
('ET','Ethiopia','ETB','en'),
('GA','Gabon','XAF','fr'),
('GM','Gambia','GMD','en'),
('GH','Ghana','GHS','en'),
('GN','Guinea','GNF','fr'),
('GW','Guinea-Bissau','XOF','pt'),
('KE','Kenya','KES','sw'),
('LS','Lesotho','LSL','en'),
('LR','Liberia','LRD','en'),
('LY','Libya','LYD','ar'),
('MG','Madagascar','MGA','fr'),
('MW','Malawi','MWK','en'),
('ML','Mali','XOF','fr'),
('MR','Mauritania','MRU','ar'),
('MU','Mauritius','MUR','fr'),
('MA','Morocco','MAD','fr'),
('MZ','Mozambique','MZN','pt'),
('NA','Namibia','NAD','en'),
('NE','Niger','XOF','fr'),
('NG','Nigeria','NGN','en'),
('RW','Rwanda','RWF','sw'),
('ST','São Tomé and Príncipe','STN','pt'),
('SN','Senegal','XOF','fr'),
('SC','Seychelles','SCR','fr'),
('SL','Sierra Leone','SLE','en'),
('SO','Somalia','SOS','sw'),
('ZA','South Africa','ZAR','zu'),
('SS','South Sudan','SSP','en'),
('SD','Sudan','SDG','ar'),
('TZ','Tanzania','TZS','sw'),
('TG','Togo','XOF','fr'),
('TN','Tunisia','TND','ar'),
('UG','Uganda','UGX','sw'),
('ZM','Zambia','ZMW','en'),
('ZW','Zimbabwe','ZWG','en')
ON CONFLICT (code) DO UPDATE SET
  name=EXCLUDED.name,
  currency_code=EXCLUDED.currency_code,
  default_language=EXCLUDED.default_language,
  updated_at=NOW();

-- Explicit catalog integrity checks.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_format;
ALTER TABLE products ADD CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
ALTER TABLE merchants DROP CONSTRAINT IF EXISTS merchants_slug_format;
ALTER TABLE merchants ADD CONSTRAINT merchants_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_code_format;
ALTER TABLE countries ADD CONSTRAINT countries_code_format CHECK (code ~ '^[A-Z]{2}$');

-- Fast admin catalog view.
CREATE OR REPLACE VIEW admin_catalog_summary AS
SELECT
  p.id AS product_id,
  p.slug,
  p.title,
  p.brand,
  p.category_slug,
  p.active AS product_active,
  COUNT(DISTINCT mp.id)::int AS offer_count,
  COUNT(DISTINCT mp.merchant_id)::int AS merchant_count,
  COUNT(DISTINCT CASE WHEN mp.availability_status IN ('available','limited','product-dependent') THEN mp.id END)::int AS available_offer_count,
  MAX(mp.updated_at) AS latest_offer_update
FROM products p
LEFT JOIN merchant_products mp ON mp.product_id = p.id
GROUP BY p.id;
