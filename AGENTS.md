# AGENTS.md – ScaffyLads

This file makes the repository congruent for **Grok Build**, Aether-style agents, and future specialist fleets.

## Project Identity

- **Name**: ScaffyLads
- **Domain**: Scaffolding & construction work journal (NZ-focused)
- **Primary User**: Sole traders and small scaffolding crews
- **Core Value**: Capture once (voice or text) → query anytime in natural language + clean compliance records

## Current Phase

**Re-alignment** – Bringing the Grok Build prototype back under the CAT architecture standards.

## Preferred Agent Behaviours (Mandatory)

1. **Reuse first** – Prefer patterns, components, and decisions already proven in Front_Line_Whanau.
2. **Local-first bias** – Default to offline-capable solutions. Cloud is progressive enhancement.
3. **Python for intelligence** – Journal engine, voice pipeline, NL query, and agent logic live in the FastAPI service.
4. **TypeScript for shell** – UI, Tauri integration, and client-side state stay in the Next.js world.
5. **Explicit HITL** – Any action that writes to production data, touches payments, or changes compliance templates requires clear human approval gates.
6. **Sovereignty** – Prefer NZ data residency and owner-controlled keys. Never silently exfiltrate journal content.

## Key Entry Points for Agents

- `ARCHITECTURE.md` – System design source of truth (read first)
- `backend/` – FastAPI service (create / extend here for NL / journal logic)
- `src/` – Next.js App Router frontend
- `src-tauri/` – Desktop packaging (to be added)
- `CAT_CONGRUENCE.md` – Alignment rules with Coastal Alpine Tech

## Naming Conventions

- Product: **ScaffyLads**
- Journal record: `JournalEntry`
- Natural language interface: “Ask Scaffy”
- Tiers: Free → Pro → Crew → Business

## What Success Looks Like

A scaffolder can:
1. Open the app on phone or laptop (even offline)
2. Speak or type the day’s work in under 60 seconds
3. Later ask “How many kms to the last three jobs?” and get an accurate answer with sources
4. Export clean records for the accountant or client

---

*Grok Build sessions must read this file and ARCHITECTURE.md before making changes.*
