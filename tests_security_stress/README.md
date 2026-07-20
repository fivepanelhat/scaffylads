# tests_security_stress

Adversarial / sovereignty checks for **ScaffyLads**, congruent with Coastal Alpine Tech fleet red-team layout.

## What runs

| Suite | Runner | Workflow |
| --- | --- | --- |
| `test_scaffylads_security_stress.py` | `pytest` | `.github/workflows/redteam.yml` |
| Vitest AI offline defaults | `npm test` | `redteam.yml` (Node job) |

## Rules

- **No third-party site scans** (no ZAP against external hosts).
- **No live API keys** in fixtures.
- Simulated prompt-injection strings stay in this folder so SAST can exclude it.

## Local

```bash
pip install pytest
python -m pytest tests_security_stress/ -v
```
