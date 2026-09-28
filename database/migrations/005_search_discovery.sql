-- TAMP Marketplace — Phase 5 search, discovery and comparison layer
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS old_price NUMERIC(18,2);
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS deal_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION tamp_products_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.brand,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.category_slug,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.description,'')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search_vector ON products;
CREATE TRIGGER trg_products_search_vector
BEFORE INSERT OR UPDATE OF title,brand,category_slug,description ON products
FOR EACH ROW EXECUTE FUNCTION tamp_products_search_vector();

UPDATE products SET search_vector =
  setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
  setweight(to_tsvector('simple', coalesce(brand,'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(category_slug,'')), 'C') ||
  setweight(to_tsvector('simple', coalesce(description,'')), 'D');

CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING GIN(brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_merchant_products_price ON merchant_products(price);
CREATE INDEX IF NOT EXISTS idx_merchant_products_deals ON merchant_products(deal_active) WHERE deal_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_merchant_products_indexed ON merchant_products(last_indexed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_country_lookup ON product_country_availability(country_code,status,merchant_product_id);

-- Fast discovery view: one row per product/destination/merchant offer.
CREATE OR REPLACE VIEW marketplace_discovery AS
SELECT
  p.id AS product_id, p.slug, p.title, p.description, p.brand, p.category_slug, p.image_url,
  mp.id AS merchant_product_id, m.id AS merchant_id, m.slug AS merchant_slug, m.name AS merchant_name,
  mp.price, mp.old_price, mp.currency_code, mp.availability_status AS merchant_offer_status,
  pca.country_code, pca.status AS destination_status,
  al.id AS affiliate_link_id, al.destination_url, al.active AS affiliate_link_active,
  mp.last_seen_at, mp.last_indexed_at
FROM products p
JOIN merchant_products mp ON mp.product_id = p.id
JOIN merchants m ON m.id = mp.merchant_id AND m.active = TRUE
LEFT JOIN product_country_availability pca ON pca.merchant_product_id = mp.id
LEFT JOIN LATERAL (
  SELECT a.id, a.destination_url, a.active
  FROM affiliate_links a
  WHERE a.merchant_product_id = mp.id
    AND (a.country_code = pca.country_code OR a.country_code IS NULL)
  ORDER BY (a.country_code IS NOT NULL) DESC, a.updated_at DESC
  LIMIT 1
) al ON TRUE
WHERE p.active = TRUE;
