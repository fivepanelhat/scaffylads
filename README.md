# ScaffyLads

<!-- BEGIN CAT_CONGRUENCE_SNIPPET -->
## Coastal Alpine Tech portfolio

[![Stage](https://img.shields.io/badge/Stage-Pre--seed-8B5CF6)](https://github.com/fivepanelhat/fivepanelhat)
[![Live MVP](https://img.shields.io/badge/Live-MVP%20on%20Vercel-0ea5e9)](https://scaffylads.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20dual%20store-0f766e)](./ROADMAP.md)
[![Local-first](https://img.shields.io/badge/Data-Local--first%20%2B%20Supabase%20opt--in-00247D)](./ARCHITECTURE.md)
[![HITL](https://img.shields.io/badge/HITL-Draft%2FPrepare%20only-dc2626)](./AGENTS.md)
[![Te Mana Raraunga](https://img.shields.io/badge/Te%20Mana%20Raraunga-Aligned-0f766e)](./COMPLIANCE.md)
[![SpaceXAI](https://img.shields.io/badge/AI-SpaceXAI%20opt--in-111827)](./COMPLIANCE.md)
[![Roadmap](https://img.shields.io/badge/Roadmap-Tick%20as%20we%20build-f59e0b)](./ROADMAP.md)
[![CI](https://github.com/fivepanelhat/scaffylads/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fivepanelhat/scaffylads/actions/workflows/ci.yml)
[![CI Scan](https://github.com/fivepanelhat/scaffylads/actions/workflows/ci-scan.yml/badge.svg?branch=main)](https://github.com/fivepanelhat/scaffylads/actions/workflows/ci-scan.yml)
[![SecOps](https://github.com/fivepanelhat/scaffylads/actions/workflows/secops.yml/badge.svg?branch=main)](https://github.com/fivepanelhat/scaffylads/actions/workflows/secops.yml)
[![RedTeam](https://github.com/fivepanelhat/scaffylads/actions/workflows/redteam.yml/badge.svg?branch=main)](https://github.com/fivepanelhat/scaffylads/actions/workflows/redteam.yml)

**Part of the [Kiwi Edge AI Stack](https://github.com/fivepanelhat/fivepanelhat)** · Org: [fivepanelhat](https://github.com/fivepanelhat) · Live: [scaffylads.vercel.app](https://scaffylads.vercel.app)

> Sovereign work journal for NZ scaffolding crews — local-first capture, multimodal notes, Ask Scaffy NL, Te Mana Raraunga aligned. FastAPI / SQLite / Tauri are **roadmap**, not live ([ROADMAP.md](./ROADMAP.md)).

**Agents inform, draft, prepare, and remind. Humans save, sign, file, send, and pay.**  
Congruence: [`CAT_CONGRUENCE.md`](./CAT_CONGRUENCE.md) · Compliance: [`COMPLIANCE.md`](./COMPLIANCE.md) · Agents: [`AGENTS.md`](./AGENTS.md)
<!-- END CAT_CONGRUENCE_SNIPPET -->

![ScaffyLads Banner](assets/social_preview.png)

---

### What is ScaffyLads?

ScaffyLads is a cross-platform AI-powered work journal purpose-built for scaffolding and construction professionals in Aotearoa New Zealand.

Capture the day by **text, paste, voice, or file note**. Then ask questions in plain English (**Ask Scaffy**):

- *“Travel kms for the last two job sites”*
- *“How many days did I work in Palmerston North this year?”*
- *“Overtime hours so far for [builder]”*
- *“Show compliance notes for the [site] scaffold”*

Live product: **https://scaffylads.vercel.app** · Mission / 5 W’s: `/mission` · Ask: `/ask`

## The 5 W's

| W | Answer |
| --- | --- |
| **Who** | Sole traders & small scaffolding crews (site leads, board hands) across Aotearoa |
| **What** | AI-native work journal + roster: multimodal capture, NL query, WorkSafe-minded logs |
| **Why** | Notes die in vans & chats; kms/OT/inspections vanish when claims come due |
| **When** | Live MVP now; SQLite / FastAPI / Tauri are roadmap ticks ([ROADMAP.md](./ROADMAP.md)) |
| **Where** | Web/PWA nationwide NZ; local-first; optional Supabase Sydney |

## Problems → solution

**Problems:** fragmented capture, compliance drag, admin after dark, data that walks away, no way to ask the past.

**Solution:** projects · shifts · logbook dual-store; multimodal capture; Ask Scaffy NL; HITL + Te Mana Raraunga alignment (see [COMPLIANCE.md](./COMPLIANCE.md), [CAT_CONGRUENCE.md](./CAT_CONGRUENCE.md)).

### Core stack (shipped now)

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js + React + TypeScript | Web app (Vercel) |
| Styling | Tailwind + CAT dark glass UI | High-clarity site UI |
| API / AI | Next.js route handlers + SpaceXAI opt-in | CRUD, Ask Scaffy, AI tidy |
| Data | Local JSON dual-store → optional Supabase Sydney | Local-first + production DB |

**Roadmap (not live):** SQLite local vault · FastAPI Python engine · Tauri desktop · full PWA offline · blob attachments.  
Tick progress in **[ROADMAP.md](./ROADMAP.md)** — no fixed dates, just checkboxes as work lands.

## Architecture Overview

> **Diagrams:** Architecture images and Mermaid maps describe the **target product architecture** for this pre-seed product. They are engineering design maps, not claims of large-scale commercial fleet deployment.

![ScaffyLads architecture overview](assets/architecture_overview.png)

### System map

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "fontSize": "15px",
    "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
    "primaryColor": "#0ea5e9",
    "primaryTextColor": "#f8fafc",
    "primaryBorderColor": "#38bdf8",
    "lineColor": "#67e8f9",
    "secondaryColor": "#1e293b",
    "tertiaryColor": "#0f172a",
    "clusterBkg": "#0b1220cc",
    "clusterBorder": "#38bdf880",
    "titleColor": "#e2e8f0"
  },
  "flowchart": {
    "nodeSpacing": 32,
    "rankSpacing": 40,
    "padding": 16,
    "htmlLabels": true,
    "curve": "basis",
    "useMaxWidth": true
  }
}}%%
flowchart TB

  classDef client fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef api fill:#134e4a,stroke:#2dd4bf,stroke-width:2px,color:#f0fdfa
  classDef ai fill:#3b0764,stroke:#e879f9,stroke-width:2px,color:#fdf4ff
  classDef store fill:#1e1b4b,stroke:#a5b4fc,stroke-width:2px,color:#eef2ff
  classDef hitl fill:#052e16,stroke:#4ade80,stroke-width:2px,color:#f0fdf4

  CREW["Crew / site lead"] --> WEB["Next.js Web + PWA"]
  CREW --> DESK["Tauri 2 desktop<br/>planned"]

  subgraph CLIENT["Client layer"]
    WEB
    DESK
    UI["Dashboard · Projects<br/>Schedule · Logbook"]
    WEB --> UI
    DESK --> UI
  end

  UI --> API["API routes<br/>projects · shifts · logs"]
  UI --> AIAPI["AI rewrite<br/>SpaceXAI opt-in"]

  subgraph DATA["Data layer"]
    STORE["Local JSON / SQLite<br/>local-first"]
    SB["Supabase optional<br/>target sync"]
  end

  API --> STORE
  AIAPI --> XAI["xAI live rewrite"]
  AIAPI --> OFF["Offline draft"]
  STORE -.-> SB

  CREW --> HITL["HITL sign-off<br/>compliance · billing"]

  class WEB,DESK,UI client
  class API api
  class AIAPI,XAI,OFF ai
  class STORE,SB store
  class HITL hitl
```

### Log + AI tidy flow

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "fontSize": "14px",
    "primaryColor": "#0ea5e9",
    "primaryTextColor": "#f8fafc",
    "primaryBorderColor": "#38bdf8",
    "lineColor": "#94a3b8"
  },
  "flowchart": { "curve": "basis", "useMaxWidth": true }
}}%%
flowchart LR
  A["Field notes"] --> B["Logbook UI"]
  B --> C["POST /api/logs"]
  C --> D["Local store<br/>not auto-uploaded"]
  B --> E["AI tidy"]
  E --> F{XAI_API_KEY?}
  F -->|no| G["Offline draft"]
  F -->|yes| H["api.x.ai"]
  G --> B
  H --> B
  B --> I["Human saves"]
```

Full detail: **[ARCHITECTURE.md](./ARCHITECTURE.md)**

### 4-Tier Subscription

- **Free** – Limited entries, basic logging
- **Pro** – Unlimited personal + full voice + natural language
- **Crew** – Shared team journals
- **Business** – Unlimited seats, branding, integrations

### Key Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) – Source of truth
- [AGENTS.md](./AGENTS.md) – Rules for Grok Build & agents
- [CAT_CONGRUENCE.md](./CAT_CONGRUENCE.md) – Coastal Alpine Tech alignment

### Quick Start

```bash
cp .env.example .env.local
# Optional: fill Supabase + XAI keys (see below)
npm install
npm run dev
```

### Checks

```bash
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm test             # vitest
npm run build        # production build
```

CI runs all four on every push and pull request.

### Supabase (production store)

Sydney project **scaffylads** (`ivprttslhudjoatsrsma`). Schema lives in
`supabase/migrations/`. Dual-mode store:

| Mode | When | Backend |
| --- | --- | --- |
| **JSON** | Supabase env unset | `data/app-data.json` (local demo) |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` + service/anon key set | Postgres tables `projects`, `shifts`, `logs` |

```bash
# Link + push migrations (already applied on the shared project)
npx supabase link --project-ref ivprttslhudjoatsrsma
npx supabase db push
```

Env (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — preferred for demo CRUD)

### Vercel

Production project: **scaffylads** on team `fivepanelhat-5998s-projects`.

Production alias: https://scaffylads-fivepanelhat-5998s-projects.vercel.app

Set these in **Project → Settings → Environment Variables** (Production + Preview):

| Name | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ivprttslhudjoatsrsma.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | server only, never expose to browser |
| `XAI_API_KEY` | optional live AI rewrite |
| `XAI_MODEL` | optional, default `grok-4.5` |

Then redeploy so the dual-store uses Supabase instead of empty local JSON.

CLI (once logged in):

```bash
npx vercel link --project scaffylads
npx vercel env pull .env.local
npx vercel --prod
```

### Where your data goes

**Local (no Supabase env):** journal data is in `data/app-data.json` (gitignored).
It is never uploaded on save.

**With Supabase env:** projects / shifts / logs are stored in the Sydney Supabase project.

The one exception is **AI tidy notes**:

| Mode | When | What leaves the device |
| --- | --- | --- |
| **Offline** (default) | No `XAI_API_KEY` set | Nothing. The draft is assembled locally. |
| **Live** | `XAI_API_KEY` is set | The work / issues / next-steps text is sent to `api.x.ai` (xAI, US) to be rewritten. |

Live mode is opt-in by the operator setting a key, and the logbook labels which
mode produced each draft. Per [CAT_CONGRUENCE.md](./CAT_CONGRUENCE.md) rule 1
and [AGENTS.md](./AGENTS.md) rule 6, nothing should leave the device without the
crew knowing — if you enable live mode, make sure that is the intent for the
journal content in question.

## License

Proprietary — © 2026 Coastal Alpine Tech Limited. All rights reserved. No
open-source grant is implied by access to this repository; see [LICENSE](./LICENSE).

Built with care for the lads on the tools.  
Coastal Alpine Tech • Taranaki / Aotearoa
