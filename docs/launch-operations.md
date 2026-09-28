# Launch Operations Runbook

## Health checks
- `GET /api/health`
- Verify database connectivity.
- Verify merchant feed freshness.
- Verify affiliate redirect tracking.
- Verify conversion/postback attribution.

## Incident priorities
- Urgent: checkout/redirect tracking outage, data exposure, widespread incorrect availability.
- High: broken merchant feed, major search/catalog outage, attribution failures.
- Normal: isolated product/feed issues.
- Low: content or non-blocking UI issues.

## Rollback
Stop newly enabled merchant feeds or countries first, then revert the application deployment if the issue is application-wide. Preserve attribution logs and audit records during rollback.
