# COMPLIANCE.md

**Coastal Alpine Tech Limited** | **Product:** ScaffyLads  
Last updated: 20 July 2026

> Alignment evidence for Super Grok / CAT fleet reviews — **not** a compliance certificate or legal advice.

## Regulatory Mapping

### New Zealand
- **Privacy Act 2020** (+ IPP awareness for operational crew/site notes)
- **WorkSafe NZ** — journal fields support inspection, height, weather, and crew-on-site records (product aid, not a certified H&S system)
- **Te Mana Raraunga** principles — primary data sovereignty lens for operational taonga

### International (where relevant later)
- **EU AI Act** — transparency and human oversight if high-risk uses are ever claimed
- **ISO/IEC 42001** — AI management system direction for mature releases
- **SOC 2** — priority if multi-tenant SaaS is productised

## Core Technical Controls (Mandatory)

| Control | How ScaffyLads implements it |
| --- | --- |
| Local-first default | JSON store without Supabase env; dual-store when configured |
| No silent exfil | AI live mode only with `XAI_API_KEY`; UI labels live vs offline |
| Owner control | Operator holds keys; service role never shipped to browser |
| HITL | Humans save logs; agents draft/tidy only |
| Residency preference | Optional Supabase Oceania (Sydney) for production |
| Purpose limitation | Capture for crew operations / compliance evidence — not ad profiling |

## Te Mana Raraunga & Te Tiriti spirit

1. **Rangatiratanga** — crews control their journals; cloud is opt-in  
2. **Whanaungatanga** — shared crew context stays purpose-limited  
3. **Kotahitanga** — CAT fleet congruence (AGENTS.md / CAT_CONGRUENCE.md)  
4. **Manaakitanga** — clear labels when text leaves the device for AI tidy/ask  
5. **Kaitiakitanga** — no training foundation models on private journals without consent  

## Governance

- High-stakes: compliance templates, billing, production migrations → human approval  
- Agents inform / draft / prepare only; humans advise / sign / file / send / pay  
- Document changes via repo PR review and CI  

## Limitations

- Not legal advice; not ISO/SOC certification  
- Confirm statute application with NZ counsel before regulated marketing claims  
- WorkSafe / IRD exports are roadmap items — fields exist to support them  
