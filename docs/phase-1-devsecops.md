# Phase 1 — Production Architecture & DevSecOps Foundation

## Architecture
- Next.js frontend and server/API routes in one deployable application.
- PostgreSQL is the system of record.
- Redis is the cache/queue foundation.
- Server-only secrets are supplied through environment variables.
- Docker provides reproducible local infrastructure and a production container image.

## Local infrastructure
```bash
docker compose up -d
```

Local services:
- PostgreSQL: `postgresql://tamp:tamp_local_password@localhost:5432/tamp_marketplace`
- Redis: `redis://localhost:6379`

## CI/CD security gates
Pull requests and pushes to the protected default branch should run:
1. foundation validation
2. automated tests
3. ESLint
4. production build
5. dependency audit
6. CodeQL SAST
7. dependency-review on pull requests

## Branch protection
Configure the repository's default branch with:
- pull request required
- required status checks for the CI quality job and CodeQL
- required review before merge
- stale approvals dismissed after new commits
- force pushes disabled
- branch deletion disabled

These repository settings must be enabled in the Git hosting provider; they cannot be enforced by source files alone.

## Secrets
Never commit `.env`, OAuth secrets, database passwords, API keys, or affiliate credentials. Store production secrets in the hosting provider's encrypted secret store. Rotate credentials if they are exposed.

## Security scanning
CodeQL provides SAST. `npm audit` checks dependency vulnerabilities. Dependency Review blocks pull requests that introduce known vulnerable packages.
