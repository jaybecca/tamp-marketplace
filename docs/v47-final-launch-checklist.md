# TAMP Marketplace v47 — Final Launch Checklist

## Completed in code
- Sentry runtime integration with PII disabled by default.
- Redis-backed rate limiting on authentication and sensitive public endpoints.
- OAuth state validation retained and Google OAuth redirects to `/account`.
- Six-language stored blog coverage validated for all 50 posts.
- Blog index and article pages use stored translations; no Gemini request during rendering.
- Arabic document RTL plus global header, account, form, grid and footer RTL rules.
- Database-driven sitemap for products, categories and merchants.
- Destination-aware affiliate routing and freshness checks from v46 retained.

## Required production verification on the deployment environment
- `npm install`
- `npm test`
- `npm run build`
- `npm run start`
- `npm run security:audit`
- Configure `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` with the Sentry project DSN.
- Configure `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` only if release/source-map uploads are desired.
- Configure PostgreSQL and Redis production credentials.
- Configure Google OAuth production callback URL.
- Add merchant/affiliate credentials separately in environment variables.
- Verify real merchant feeds and country availability.
- Test all six languages on desktop/mobile, including Arabic RTL.
- Test registration, email sign-in, Google sign-in, account dropdown and sign-out.
- Test affiliate redirect tracking with real affiliate credentials.
- Confirm legal pages and affiliate disclosure before public launch.

## Security test scope
Automated source-level launch checks cover authentication/session hardening, OAuth state handling, rate-limit presence, sensitive endpoint protection, Sentry configuration, RTL/accessibility foundations, sitemap generation and stored blog localization coverage. A live penetration test still requires running the deployed application against a controlled test environment.
