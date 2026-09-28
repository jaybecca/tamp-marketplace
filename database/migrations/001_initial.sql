-- TAMP Marketplace — Phase 1 PostgreSQL foundation
-- TAMP is an affiliate discovery/comparison layer. It does not fulfill orders.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS countries (
  code CHAR(2) PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code CHAR(3) NOT NULL,
  default_language TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website_url TEXT NOT NULL,
  affiliate_network TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_country_availability (
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available','limited','product-dependent','not-available','unknown')),
  source TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  PRIMARY KEY (merchant_id, country_code)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category_slug TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  source_sku TEXT,
  source_url TEXT NOT NULL,
  price NUMERIC(18,2),
  currency_code CHAR(3),
  availability_status TEXT NOT NULL DEFAULT 'unknown' CHECK (availability_status IN ('available','limited','product-dependent','not-available','unknown')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, merchant_id, source_sku)
);

CREATE TABLE IF NOT EXISTS product_country_availability (
  merchant_product_id UUID NOT NULL REFERENCES merchant_products(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available','limited','product-dependent','not-available','unknown')),
  source TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  PRIMARY KEY (merchant_product_id, country_code)
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_product_id UUID NOT NULL REFERENCES merchant_products(id) ON DELETE CASCADE,
  country_code CHAR(2) REFERENCES countries(code),
  destination_url TEXT NOT NULL,
  tracking_provider TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_products_product ON merchant_products(product_id);
CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant ON merchant_products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_product_country_country ON product_country_availability(country_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(merchant_product_id);
