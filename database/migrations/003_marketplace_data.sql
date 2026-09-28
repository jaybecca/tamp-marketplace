-- TAMP Marketplace — Phase 3 marketplace data + admin foundation
CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin'));

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_slug_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_slug_fkey FOREIGN KEY (category_slug) REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_merchants_active ON merchants(active);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(active);
CREATE INDEX IF NOT EXISTS idx_merchant_country_status ON merchant_country_availability(status);
CREATE INDEX IF NOT EXISTS idx_product_country_status ON product_country_availability(status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_merchant_products_source
  ON merchant_products(product_id, merchant_id, COALESCE(source_sku, source_url));

INSERT INTO categories(slug,name,icon) VALUES
('electronics','Electronics','💻'),('wearables','Wearables','⌚'),('phones','Phones','📱'),('laptops','Laptops','💻'),('fashion','Fashion','👕'),
('shoes','Shoes','👟'),('beauty','Beauty','💄'),('home-living','Home & Living','🛋️'),('sports','Sports','⚽'),
('toys','Toys','🧸'),('automotive','Automotive','🚙'),('books','Books','📚'),('audio','Audio','🎧')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, updated_at=NOW();

INSERT INTO countries(code,name,currency_code,default_language) VALUES
('NG','Nigeria','NGN','en'),('GH','Ghana','GHS','en'),('KE','Kenya','KES','en'),('EG','Egypt','EGP','ar'),
('MA','Morocco','MAD','fr'),('UG','Uganda','UGX','en'),('SN','Senegal','XOF','fr'),('CI','Côte d’Ivoire','XOF','fr')
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name,currency_code=EXCLUDED.currency_code,default_language=EXCLUDED.default_language,updated_at=NOW();

INSERT INTO merchants(name,slug,website_url,affiliate_network) VALUES
('Amazon','amazon','https://www.amazon.com',''),('JUMIA','jumia','https://www.jumia.com',''),
('AliExpress','aliexpress','https://www.aliexpress.com',''),('eBay','ebay','https://www.ebay.com',''),('TEMU','temu','https://www.temu.com','')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,website_url=EXCLUDED.website_url,updated_at=NOW();
