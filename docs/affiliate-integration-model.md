# TAMP Marketplace — Affiliate Integration Model

TAMP is the discovery/comparison layer. Merchants remain responsible for checkout, payment, fulfillment, delivery, returns and customer service.

## Flow

Discover → Compare → TAMP tracked link → Merchant checkout

## Integration layers

- `affiliate_networks`: network/provider registry.
- `merchant_feed_configs`: API/CSV/XML/JSON/network feed configuration and sync status.
- `merchant_products`: normalized merchant offers tied to canonical products.
- `affiliate_links`: country-aware deep-link destinations and tracking metadata.
- `/go/[id]`: tracked redirect that records the click before sending the shopper to the merchant.
- `affiliate_conversions`: network/merchant conversion and commission attribution records.
- `merchant_verifications`: auditable verification history.

## External feed ingestion

Authenticated feed providers can POST normalized products to `/api/feeds/{merchant}` using the `AFFILIATE_FEED_API_KEY` bearer token. The importer upserts canonical products and merchant offers without treating the feed as a checkout system.

## Privacy

Affiliate click records store a salted SHA-256 IP hash rather than the raw IP address. Use a strong production `TRACKING_HASH_SALT`.

## Live activation

Network credentials, merchant feed credentials, approved affiliate accounts, production callback/deep-link settings, and network-specific conversion postbacks must be configured before live commissions can be attributed.
