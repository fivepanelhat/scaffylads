# ScaffyLads roadmap

Living checklist — **tick items as they land**. No calendar commitments; order is preference, not a promise.

> **Truth rule:** Banners, README, and `/architecture` must match **shipped** vs **roadmap**. Do not market FastAPI, SQLite, or Tauri as live until the box is checked.

**Live product:** https://scaffylads.vercel.app  
**Source of truth for design:** [ARCHITECTURE.md](./ARCHITECTURE.md) · congruence: [CAT_CONGRUENCE.md](./CAT_CONGRUENCE.md)

---

## Legend

- `[x]` — done in main / production
- `[ ]` — not started or only stubbed
- `(partial)` — usable but incomplete

---

## 0. Shipped today (baseline)

Do not un-check without a deliberate rollback.

- [x] Next.js App Router web UI (dashboard, projects, schedule, logbook)
- [x] Mission narrative (5 W’s, problems, solution, Te Mana / governance)
- [x] Architecture page with current vs target clarity
- [x] Next.js API routes: `/api/projects`, `/api/shifts`, `/api/logs`
- [x] Dual store: local JSON **or** Supabase (Sydney) when env set
- [x] Supabase schema migration for projects / shifts / logs
- [x] Vercel production deploy + env wiring
- [x] Ask Scaffy NL (`/ask` + `/api/ai/ask`) — offline heuristics + optional SpaceXAI
- [x] AI tidy notes (`/api/ai/rewrite`) — offline draft + optional SpaceXAI
- [x] Multimodal log capture: text, paste dump, browser voice, file-name attachment note
- [x] Fleet-style social_preview + architecture banners
- [x] COMPLIANCE.md / CAT_CONGRUENCE.md / AGENTS.md
- [x] Vitest unit tests for store APIs + AI paths
- [x] Playwright e2e smoke config present

---

## 1. Product truth & docs

- [x] Roadmap file with tickable items (this file)
- [x] Architecture banner reflects **as-built** stack (not FastAPI/SQLite as live)
- [ ] README “current stack” table auto-aligned with this roadmap
- [ ] Open Graph / social copy free of unshipped tech claims
- [ ] Changelog (or GitHub Releases) for each ticked epic

---

## 2. Data layer

- [x] JSON file store (`data/app-data.json`) for local / demo
- [x] Supabase Postgres dual-store when env configured
- [ ] **SQLite** local-first store (replace or sit under JSON for desktop/offline)
- [ ] Explicit export: CSV / PDF pack for accountant & client
- [ ] Import from CSV / simple spreadsheet
- [ ] Soft-delete + trash / restore
- [ ] Attachment blobs (photos/PDFs) in object storage or local vault — not just filename notes
- [ ] Optional end-to-end encryption for journal payloads at rest
- [ ] Multi-device sync with conflict policy (last-write / merge rules)
- [ ] Auth: crew login (Supabase Auth or equivalent) + RLS tightened beyond open demo policies

---

## 3. Intelligence layer

- [x] SpaceXAI-compatible rewrite (opt-in key)
- [x] Offline rewrite draft (no network)
- [x] Ask Scaffy offline answers over journal snapshot
- [x] Ask Scaffy live answers when key set
- [ ] **FastAPI** journal engine service (Python brain per CAT congruence)
- [ ] Structured extraction: kms, OT hours, heights, materials from free text
- [ ] “Ask Scaffy” citation of source log/shift IDs in every answer
- [ ] Local / edge LLM path (Ollama or CAT edge node) for air-gapped sites
- [ ] Voice → structured fields (not only dump into work-done)
- [ ] Vision: photo of whiteboard / scaffold tag → draft log fields
- [ ] Crew-safe templates for WorkSafe-style daily checks (HITL before “official”)

---

## 4. Client surfaces

- [x] Responsive web app
- [ ] PWA install (manifest, service worker, offline shell)
- [ ] **Tauri 2** desktop (Windows + Linux first)
- [ ] Mobile-first log capture UX (thumb zones, offline queue)
- [ ] Push / local reminders for open inspections
- [ ] Printable site day sheet

---

## 5. Security · compliance · governance

- [x] No silent AI exfil (labels + key-gated live mode)
- [x] Service role not exposed to browser
- [x] Te Mana Raraunga spirit documented
- [ ] Formal threat model for multi-crew tenancy
- [ ] Audit log of who changed compliance-critical fields
- [ ] HITL gates in UI for “mark official / send to client”
- [ ] Privacy Act collection notice in-product
- [ ] Data residency toggle UI (local only vs Supabase region)
- [ ] Penetration / dependency audit cadence (documented)

---

## 6. Ops & quality

- [x] CI-friendly scripts (type-check, lint, test, build)
- [x] GitHub Actions: `ci.yml` + `ci-scan.yml` + `secops.yml` + `redteam.yml`
- [x] Red-team suite `tests_security_stress/` (sovereignty / offline AI defaults)
- [ ] Preview deploys per PR (Vercel)
- [ ] Error monitoring (Sentry or equivalent) with PII scrubbing
- [ ] Seed / reset demo data command
- [ ] Load test for Ask Scaffy with large journals
- [ ] Accessibility pass (keyboard, contrast, labels)

---

## 7. Commercial / crew features (later)

- [ ] Free → Pro → Crew → Business tier gates (see AGENTS.md)
- [ ] Multi-crew / multi-company tenancy
- [ ] Client portal (read-only job progress)
- [ ] Quote / invoice handoff hooks (no auto-pay without HITL)
- [ ] White-label for larger scaffolding firms

---

## How to tick an item

1. Ship the capability on `main` and production (or document why prod is blocked).
2. Change `[ ]` → `[x]` in this file in the same PR when possible.
3. If the architecture diagram would mislead, update banner + `/architecture` in that PR.
4. Prefer small ticks over big silent leaps.

---

*Coastal Alpine Tech · ScaffyLads · tick as we build, not as we dream.*
