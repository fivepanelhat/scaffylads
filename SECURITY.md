# Security Policy

**Coastal Alpine Tech Limited** · Last updated: 2026-07-21

## Reporting a vulnerability

Please open a private GitHub Security Advisory on this repository, or contact the org maintainers via the [fivepanelhat](https://github.com/fivepanelhat) profile. Do not file public issues for unfixed criticals.

## Fleet security principles

- **No silent exfiltration** of personal or tenant operational data
- Prefer **local-first** processing; third-party AI only with explicit operator configuration and disclosure
- Least privilege credentials; never commit secrets or service-role keys
- High-stakes production changes require human approval (HITL)
- SecOps / red-team / dependency scanning on fleet cadence where CI is present

## Supported versions

Security fixes target the default branch (`main`) of this repository.

