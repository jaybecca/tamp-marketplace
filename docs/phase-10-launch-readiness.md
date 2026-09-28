# Phase 10 — Launch & Market Activation

TAMP Marketplace is affiliate-only: TAMP discovers and compares offers; the merchant handles checkout, payment, shipping, returns and customer service.

## Launch gates
- Affiliate-network approvals: obtain and record production approval IDs.
- Merchant partnerships: verify merchant terms, feeds, destination coverage and affiliate terms.
- Initial catalog: load only products with valid source, price, availability and freshness metadata.
- Initial countries: activate countries only after merchant/product destination validation.
- Domain/DNS/SSL: point the production domain, enforce HTTPS and verify redirects/canonical URLs.
- Production deployment: configure environment secrets, database migrations, scheduled sync jobs and backups.
- Final acceptance testing: run auth, search, comparison, affiliate click, conversion attribution, localization, RTL, accessibility and mobile checks.
- Launch monitoring: monitor uptime, API errors, feed freshness, outbound clicks, conversions and support volume.
- Support workflow: route web tickets to the support team; merchant order issues remain with the merchant.

## Production environment
Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain. Configure `DATABASE_URL`, Google OAuth credentials, affiliate credentials, tracking salt and monitoring/analytics IDs. Never commit secrets.

## Suggested launch sequence
1. Deploy to staging and run migrations.
2. Connect and validate one affiliate network and one merchant feed.
3. Validate one or two initial countries end-to-end.
4. Run final acceptance tests.
5. Deploy production and verify HTTPS, robots, sitemap and canonical URLs.
6. Enable remaining approved merchants/countries progressively.
7. Monitor and review the launch checklist daily during the initial launch period.

## Support
Public support: WhatsApp `+234 915 234 5733` and the supplied TAMP support contact. TAMP does not resolve merchant checkout, delivery, refund or return issues; customers should contact the merchant for those transactions.
