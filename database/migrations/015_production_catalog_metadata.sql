-- TAMP Marketplace v48: database-driven blog index metadata and production catalog metadata
ALTER TABLE countries ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'Africa';
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji TEXT NOT NULL DEFAULT '🌍';
ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency_symbol TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS merchant_type TEXT;

UPDATE countries SET region='West Africa',flag_emoji='🇳🇬',currency_symbol='₦' WHERE code='NG';
UPDATE countries SET region='West Africa',flag_emoji='🇬🇭',currency_symbol='GH₵' WHERE code='GH';
UPDATE countries SET region='East Africa',flag_emoji='🇰🇪',currency_symbol='KSh' WHERE code='KE';
UPDATE countries SET region='North Africa',flag_emoji='🇪🇬',currency_symbol='E£' WHERE code='EG';
UPDATE countries SET region='North Africa',flag_emoji='🇲🇦',currency_symbol='MAD' WHERE code='MA';
UPDATE countries SET region='East Africa',flag_emoji='🇺🇬',currency_symbol='USh' WHERE code='UG';
UPDATE countries SET region='West Africa',flag_emoji='🇸🇳',currency_symbol='CFA' WHERE code='SN';
UPDATE countries SET region='West Africa',flag_emoji='🇨🇮',currency_symbol='CFA' WHERE code='CI';

UPDATE merchants SET icon=CASE slug WHEN 'amazon' THEN 'a' WHEN 'jumia' THEN '✦' WHEN 'aliexpress' THEN 'AE' WHEN 'ebay' THEN 'e' WHEN 'temu' THEN 'TEMU' ELSE LEFT(name,1) END, merchant_type=CASE slug WHEN 'aliexpress' THEN 'ali' ELSE slug END;

INSERT INTO merchant_country_availability(merchant_id,country_code,status,source,verified_at)
SELECT m.id,c.code,CASE
  WHEN m.slug='jumia' THEN 'available'
  WHEN m.slug='temu' THEN 'unknown'
  ELSE 'product-dependent'
END,'TAMP baseline merchant coverage',NOW()
FROM merchants m CROSS JOIN countries c
WHERE m.active=TRUE AND c.active=TRUE
ON CONFLICT (merchant_id,country_code) DO UPDATE SET status=EXCLUDED.status,verified_at=EXCLUDED.verified_at;

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL DEFAULT 'tamp-editorial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO blog_posts(slug) VALUES
('laptop-battery-life-shopping-guide'),
('phone-storage-128gb-256gb-512gb'),
('refurbished-electronics-checklist'),
('international-shopping-hidden-costs'),
('noise-cancelling-headphones'),
('gaming-laptop-graphics'),
('usb-c-cables-guide'),
('power-banks-travel'),
('smartwatch-phone-compatibility'),
('wifi-router-home'),
('air-fryer-size'),
('mattress-online-shopping'),
('office-chair-ergonomics'),
('standing-desk'),
('running-shoes-online'),
('sneaker-authenticity'),
('fashion-size-charts'),
('sunscreen-shopping'),
('hair-dryer-features'),
('skincare-ingredient-shopping'),
('school-backpacks'),
('toys-age-ratings'),
('board-games-family'),
('camera-beginner'),
('phone-camera-marketing'),
('portable-bluetooth-speakers'),
('tv-size-room'),
('monitor-work'),
('monitor-gaming-refresh'),
('ssd-vs-hdd'),
('printer-home'),
('kitchen-blender'),
('coffee-machine'),
('vacuum-cleaner'),
('smart-lighting'),
('security-cameras'),
('car-phone-mount'),
('dashcam'),
('luggage'),
('travel-adapters'),
('water-bottles'),
('fitness-trackers'),
('yoga-mats'),
('books-online'),
('ebook-readers'),
('gift-shopping'),
('price-history'),
('merchant-trust'),
('affiliate-shopping'),
('destination-shopping')
ON CONFLICT (slug) DO UPDATE SET active=TRUE,updated_at=NOW();
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(active,updated_at DESC);

ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS tracking_ready BOOLEAN NOT NULL DEFAULT FALSE;
