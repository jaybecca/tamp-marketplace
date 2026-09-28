# TAMP Marketplace — Phase 9 Quality Audit

## Localization / RTL
- Supported QA locales: English (`en`), French (`fr`), Arabic (`ar`), Kiswahili (`sw`), Portuguese (`pt`), and Zulu (`zu`).
- Arabic switches the document direction to RTL at runtime.
- Language and currency preferences remain persisted on-device.
- QA should verify translated navigation, forms, filters, empty states, policy pages and error states at narrow and wide widths.

## Responsive QA
Test 320px, 375px, 430px, 768px, 1024px, 1280px and 1440px viewports.
Check header overflow, hero wrapping, cards, tables, forms, comparison views, admin views and RTL layouts.

## Accessibility baseline
- Skip-to-content link.
- Visible keyboard focus indicators.
- Reduced-motion support.
- Native labels and semantic headings should be preserved.
- Images require meaningful alt text unless decorative.
- Color contrast and keyboard operation must be checked before launch.

## Performance / images
- Next.js image optimization enabled with AVIF/WebP output and caching.
- Avoid oversized source assets and use responsive image dimensions.
- Monitor Core Web Vitals in production.

## Error monitoring
- Application and global error boundaries remain active.
- `/api/monitoring/client-error` accepts sanitized client error reports.
- Production should connect these events to a managed monitoring service and alerting channel.

## Security audit
- HttpOnly authentication cookies.
- SameSite session cookies.
- Passwords hashed with scrypt.
- OAuth state protection.
- Security response headers and production HSTS.
- Admin routes require server-side authorization.
- Affiliate tracking hashes IP-derived data.
- Production secrets must remain outside source control.
- Before launch, perform dependency, penetration, OAuth, database, authorization and rate-limit testing.

## Legal review
Current policy pages cover privacy, cookies, terms, affiliate disclosure and accessibility. This is a product/legal-review foundation, not legal advice. Before launch, qualified counsel should review the policies for every operating jurisdiction, affiliate-network disclosure requirements, privacy/data rights, cookie consent, consumer protection, advertising disclosures and merchant-link terms.


## Phase 9 release gates
- Responsive checks cover 320px, 375px, 430px, 768px, 1024px, 1280px and 1440px.
- All six supported locales are represented in the localization layer and structured-data `inLanguage`.
- Arabic is RTL; other supported locales remain LTR.
- Production image optimization uses AVIF/WebP and responsive Next.js image handling.
- Security headers include HSTS in production, frame protection, MIME sniffing protection, permissions restrictions, COOP/CORP and referrer policy.
- Client and global error boundaries report sanitized events to the monitoring endpoint.
- Automated quality/security regression tests must pass before production deployment.
- Legal policy pages are present; jurisdiction-specific legal review remains a human/legal-counsel gate and is not represented as completed by automated testing.
