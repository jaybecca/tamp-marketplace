# TAMP Marketplace destination-aware affiliate model

TAMP Marketplace is an affiliate discovery layer. It does not own inventory, take payment, ship products, or handle returns.

## Core entities

- `countries`: supported shopping destinations and local currency metadata.
- `merchants`: participating marketplaces and their merchant-level destination coverage.
- `merchant_country_availability`: in the production database, this should become a first-class table with `merchant_id`, `country_code`, `status`, `source`, `verified_at`, and optional notes.
- `products`: normalized product records.
- `merchant_products`: a product-to-merchant offer relationship containing price, source SKU/URL, currency, last-seen timestamp, and affiliate-link reference.
- `product_country_availability`: optional product-level destination override when the merchant-level status is not enough.
- `affiliate_links`: the actual tracked destination URL used when a shopper clicks through. These are intentionally not populated with fake URLs in this frontend build.

## Availability statuses

`available` means the merchant source says the destination is supported at merchant level.

`product-dependent` means the merchant may serve the country but the individual listing/seller must be checked.

`limited` means only some products, regions, or delivery methods are supported.

`not-available` means the current merchant-level source says the destination is not supported.

`unknown` means TAMP has not verified the destination yet.

## AI's role

AI can normalize merchant feeds, classify products, map categories/brands, detect duplicate products, extract attributes, and improve search relevance. AI must not invent shipping coverage. Destination availability should come from merchant APIs, affiliate feeds, published merchant data, or verified TAMP data.

## Affiliate flow

1. Shopper selects a destination country.
2. TAMP filters/ranks merchant offers using verified destination data.
3. Shopper opens a product/offer.
4. TAMP sends the shopper to the merchant through the tracked affiliate URL.
5. Merchant handles checkout, payment, inventory, shipping, taxes, returns and customer support.
6. Affiliate network/merchant reports qualifying conversion data back to TAMP.

The current frontend uses demo catalog data and merchant destination statuses. Live APIs, affiliate networks, tracked outbound URLs, price feeds and automated verification are a later integration layer.
