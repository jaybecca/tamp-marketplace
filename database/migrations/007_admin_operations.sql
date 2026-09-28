-- TAMP Marketplace — Phase 7 admin & business operations
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_product_id UUID NOT NULL REFERENCES merchant_products(id) ON DELETE CASCADE,
  country_code CHAR(2) REFERENCES countries(code) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent NUMERIC(6,2) CHECK (discount_percent >= 0 AND discount_percent <= 100),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deals_active_dates ON deals(active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_deals_country ON deals(country_code);

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('page','blog','banner','faq')),
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_status_type ON content_items(status, content_type, updated_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_log(entity_type, entity_id);

CREATE OR REPLACE VIEW affiliate_business_summary AS
SELECT
  COUNT(DISTINCT ac.id)::int AS clicks,
  COUNT(DISTINCT cv.id)::int AS conversions,
  COALESCE(SUM(CASE WHEN cv.status='approved' THEN cv.order_value ELSE 0 END),0)::numeric AS approved_order_value,
  COALESCE(SUM(CASE WHEN cv.status='approved' THEN cv.commission_amount ELSE 0 END),0)::numeric AS approved_commission
FROM affiliate_clicks ac
FULL OUTER JOIN affiliate_conversions cv ON cv.affiliate_link_id = ac.affiliate_link_id;
