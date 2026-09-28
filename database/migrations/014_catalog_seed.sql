-- TAMP Marketplace v44: production catalog seed from the approved discovery catalog.
-- Affiliate credentials are intentionally not stored here; affiliate links remain inactive until configured.
INSERT INTO products (slug,title,description,brand,category_slug,active)
VALUES
('apple-airpods-pro-2','Apple AirPods Pro (2nd Gen)','Premium wireless earbuds with active noise cancellation and a compact charging case.','Apple','audio',TRUE),
('samsung-galaxy-s24','Samsung Galaxy S24','A flagship Android smartphone with a bright display, advanced camera system and long battery life.','Samsung','phones',TRUE),
('lenovo-ideapad-3','Lenovo IdeaPad 3 Laptop','Everyday laptop designed for study, work, browsing and entertainment.','Lenovo','laptops',TRUE),
('samsung-galaxy-watch-6','Samsung Galaxy Watch 6','Smartwatch with fitness tracking, notifications and health-focused features.','Samsung','wearables',TRUE),
('nike-air-force-1','Nike Air Force 1','Classic everyday sneakers with a clean silhouette and comfortable cushioning.','Nike','shoes',TRUE),
('apple-iphone-15','Apple iPhone 15','Modern iPhone with a high-resolution camera system and USB-C connectivity.','Apple','phones',TRUE),
('sony-wh-1000xm5','Sony WH-1000XM5 Headphones','Premium over-ear headphones with immersive sound and noise cancellation.','Sony','audio',TRUE),
('dell-inspiron-15','Dell Inspiron 15','Versatile laptop for productivity, schoolwork and everyday computing.','Dell','laptops',TRUE),
('adidas-ultraboost','Adidas Ultraboost','Cushioned running shoes designed for daily comfort and active use.','Adidas','shoes',TRUE),
('canon-eos-r50','Canon EOS R50 Camera','Compact mirrorless camera for creators, photography and video.','Canon','electronics',TRUE),
('apple-macbook-air-m3','MacBook Air M3','Lightweight performance laptop powered by Apple silicon.','Apple','laptops',TRUE),
('samsung-galaxy-tab-s9','Samsung Galaxy Tab S9','Premium tablet for entertainment, productivity and creative work.','Samsung','electronics',TRUE)
ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,brand=EXCLUDED.brand,category_slug=EXCLUDED.category_slug,active=TRUE,updated_at=NOW();

INSERT INTO merchant_products(product_id,merchant_id,source_sku,source_url,price,currency_code,availability_status,last_seen_at)
SELECT p.id,m.id,x.sku,x.url,x.price,x.currency,x.status,NOW()
FROM (VALUES
('apple-airpods-pro-2','amazon','amazon-airpods-pro-2','https://www.amazon.com/','179','USD','product-dependent'),('apple-airpods-pro-2','ebay','ebay-airpods-pro-2','https://www.ebay.com/','185','USD','product-dependent'),
('samsung-galaxy-s24','amazon','amazon-s24','https://www.amazon.com/','649','USD','product-dependent'),('samsung-galaxy-s24','jumia','jumia-s24','https://www.jumia.com/','695','USD','available'),
('lenovo-ideapad-3','jumia','jumia-ideapad-3','https://www.jumia.com/','429','USD','available'),('lenovo-ideapad-3','aliexpress','ali-ideapad-3','https://www.aliexpress.com/','410','USD','product-dependent'),
('samsung-galaxy-watch-6','amazon','amazon-watch-6','https://www.amazon.com/','199','USD','product-dependent'),('samsung-galaxy-watch-6','ebay','ebay-watch-6','https://www.ebay.com/','205','USD','product-dependent'),
('nike-air-force-1','ebay','ebay-af1','https://www.ebay.com/','89','USD','product-dependent'),('nike-air-force-1','jumia','jumia-af1','https://www.jumia.com/','96','USD','available'),
('apple-iphone-15','jumia','jumia-iphone-15','https://www.jumia.com/','699','USD','available'),('apple-iphone-15','ebay','ebay-iphone-15','https://www.ebay.com/','670','USD','product-dependent'),
('sony-wh-1000xm5','amazon','amazon-xm5','https://www.amazon.com/','299','USD','product-dependent'),('sony-wh-1000xm5','ebay','ebay-xm5','https://www.ebay.com/','285','USD','product-dependent'),
('dell-inspiron-15','aliexpress','ali-dell-15','https://www.aliexpress.com/','579','USD','product-dependent'),('dell-inspiron-15','ebay','ebay-dell-15','https://www.ebay.com/','595','USD','product-dependent'),
('adidas-ultraboost','ebay','ebay-ultraboost','https://www.ebay.com/','109','USD','product-dependent'),('adidas-ultraboost','jumia','jumia-ultraboost','https://www.jumia.com/','115','USD','available'),
('canon-eos-r50','temu','temu-eos-r50','https://www.temu.com/','679','USD','unknown'),('canon-eos-r50','ebay','ebay-eos-r50','https://www.ebay.com/','690','USD','product-dependent'),
('apple-macbook-air-m3','amazon','amazon-mba-m3','https://www.amazon.com/','999','USD','product-dependent'),('apple-macbook-air-m3','ebay','ebay-mba-m3','https://www.ebay.com/','1020','USD','product-dependent'),
('samsung-galaxy-tab-s9','jumia','jumia-tab-s9','https://www.jumia.com/','599','USD','available'),('samsung-galaxy-tab-s9','aliexpress','ali-tab-s9','https://www.aliexpress.com/','560','USD','product-dependent')
) AS x(slug,merchant,sku,url,price,currency,status)
JOIN products p ON p.slug=x.slug JOIN merchants m ON m.slug=x.merchant
ON CONFLICT (product_id,merchant_id,source_sku) DO UPDATE SET source_url=EXCLUDED.source_url,price=EXCLUDED.price,currency_code=EXCLUDED.currency_code,availability_status=EXCLUDED.availability_status,last_seen_at=NOW();

INSERT INTO product_country_availability(merchant_product_id,country_code,status,source,verified_at)
SELECT mp.id,c.code,CASE WHEN mp.availability_status='available' THEN 'available' ELSE mp.availability_status END,'TAMP catalog seed',NOW()
FROM merchant_products mp CROSS JOIN countries c
ON CONFLICT (merchant_product_id,country_code) DO UPDATE SET status=EXCLUDED.status,verified_at=NOW();

INSERT INTO affiliate_links(merchant_product_id,country_code,destination_url,tracking_provider,active)
SELECT mp.id,c.code,mp.source_url,NULL,FALSE
FROM merchant_products mp CROSS JOIN countries c
ON CONFLICT DO NOTHING;

UPDATE merchant_products mp SET old_price = v.old_price
FROM (VALUES
('amazon-airpods-pro-2',309),('ebay-airpods-pro-2',NULL),('amazon-s24',999),('jumia-s24',NULL),
('jumia-ideapad-3',599),('ali-ideapad-3',NULL),('amazon-watch-6',299),('ebay-watch-6',NULL),
('ebay-af1',145),('jumia-af1',NULL),('jumia-iphone-15',799),('ebay-iphone-15',NULL),
('amazon-xm5',399),('ebay-xm5',NULL),('ali-dell-15',699),('ebay-dell-15',NULL),
('ebay-ultraboost',180),('jumia-ultraboost',NULL),('temu-eos-r50',799),('ebay-eos-r50',NULL),
('amazon-mba-m3',1199),('ebay-mba-m3',NULL),('jumia-tab-s9',799),('ali-tab-s9',NULL)
) AS v(source_sku,old_price) WHERE mp.source_sku=v.source_sku;
