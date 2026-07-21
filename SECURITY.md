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

## Data sales and third parties

- **We do not sell personal information or customer operational data to third parties.**
- Optional AI or cloud services run only when configured by the operator; processing must be disclosed (in-product and/or docs).
- Prefer local-first paths so third-party transfer is unnecessary by default.

## NZ Privacy Act and Te Mana Raraunga

- Design in accordance with the **Privacy Act 2020**.
- Operate in accordance with **Te Mana Raraunga** principles for Māori data sovereignty interests.
- Align AI features with **NZ AI safety** / responsible AI expectations (HITL, transparency, no silent training on private content).

