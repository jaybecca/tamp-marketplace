
## Local PostgreSQL + Redis configuration

For local authentication testing, set the real `DATABASE_URL` from Neon and `REDIS_URL` from Redis Cloud. Keep these values out of Git.

Neon uses a PostgreSQL connection string such as:
`postgresql://USER:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require`

Redis Cloud uses a URL such as:
`redis://default:PASSWORD@HOST:PORT`

If Redis gives you a command beginning with `redis-cli -u`, put only the URL after `-u` into `REDIS_URL`.

Authentication requires `DATABASE_URL`; Redis is supporting infrastructure and is not a replacement for PostgreSQL.

## v30

Auth pages now use the full marketplace header, mobile navigation and footer, with an explicit Continue browsing link. The production email/password auth remains PostgreSQL-backed and requires DATABASE_URL.

## v1

Authentication polish, persistent language/currency preferences, footer branding, password reveal controls, Google sign-in option, and auth-specific header.

# TAMP Marketplace — Phase 1 Shopping Pages

This build continues from the TAMP Marketplace trust-premium homepage and upgrades the core shopping experience:

- Products: discovery, destination awareness, search, sorting and working category/brand/merchant filters
- Product details: merchant offer comparison and destination-aware purchase guidance
- Categories: premium category directory and discovery flow
- Category details: curated products and comparison guidance
- Deals: dedicated deal discovery experience
- Search: polished search experience with popular searches and result states

## Business model
TAMP Marketplace is an affiliate discovery/comparison marketplace. TAMP does not hold inventory or fulfill orders. Customers complete checkout directly with the merchant. Prices, delivery, taxes, availability and returns should be confirmed on the merchant website.

## Local development
```bash
cd /Users/mac/Downloads/tmarketplace
rm -rf .next node_modules
npm install
npm run dev
```

Open http://localhost:3000

The ZIP root folder is intentionally named `tmarketplace`.

## Ecommerce functionality in this build
- Destination-aware product discovery and merchant source labels
- Functional saved products/wishlist using browser local storage
- Functional shopping list using browser local storage
- Header counters for saved products and shopping list
- Merchant/source explanation on product detail pages
- Clear TAMP → merchant checkout flow; TAMP does not process payment or fulfillment
- Next.js development indicator disabled for a cleaner development preview

## Production foundation
See `docs/phase-1-devsecops.md` for the Docker, PostgreSQL, Redis, CI/CD, secrets, branch-protection, SAST, dependency-scanning and testing baseline.

## Local account testing

Email signup/sign-in requires PostgreSQL. For local development:

```bash
docker compose up -d postgres
export DATABASE_URL='postgresql://tamp:tamp_local_password@localhost:5432/tamp_marketplace'
npm run dev
```

For production, set `DATABASE_URL` to the connection string supplied by your managed PostgreSQL provider. Never commit the production value.

## v44 production/security updates
- Next.js upgraded to 16.3.6, the September 22, 2026 security patch.
- Added Redis-backed rate limiting with an in-memory fallback for local development.
- Added complete residual UI translation fallback through the existing server-side Gemini translation service.
- Added PostgreSQL catalog seed migration `014_catalog_seed.sql`; affiliate links are inactive until merchant credentials are configured.
- Customer product, search and deals listings now read the production catalog layer.
