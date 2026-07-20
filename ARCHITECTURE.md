# ScaffyLads Architecture

## Overview

ScaffyLads is a sovereign, offline-capable AI work journal for scaffolding and construction crews in Aotearoa New Zealand.

It prioritises local-first data, voice + natural language interaction, and clean compliance records.

**This document is the source of truth.** Every future build (including Grok Build sessions) must stay congruent with these decisions.

> **Diagrams:** Architecture images and Mermaid maps describe the **target product architecture** for this pre-seed product. They are engineering design maps, not claims of large-scale commercial fleet deployment.

![ScaffyLads architecture overview](assets/architecture_overview.png)

## Core Principles (Non-negotiable)

1. **Local-first / Offline-first** – Journal entries live on device first. Sync is optional and explicit.
2. **Data Sovereignty** – User and crew data under owner control. Prefer NZ residency for any cloud components.
3. **Voice + Natural Language** – Capture and query by speaking or typing plain English (“Ask Scaffy”).
4. **Progressive Enhancement** – Core logging works fully offline. Cloud features layer on top.
5. **Congruence with Front_Line_Whanau** – Reuse design patterns, Tauri packaging approach, and engineering discipline.
6. **HITL for high-stakes** – Compliance templates, billing, and production data changes require human approval.

## System map (target)

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
  classDef edge fill:#422006,stroke:#fbbf24,stroke-width:2px,color:#fffbeb
  classDef hitl fill:#052e16,stroke:#4ade80,stroke-width:2px,color:#f0fdf4

  CREW["Crew / site lead"] --> WEB["Next.js Web + PWA"]
  CREW --> DESK["Tauri 2 desktop<br/>Windows + Linux planned"]

  subgraph CLIENT["Client layer"]
    WEB
    DESK
    UI["Dashboard · Projects<br/>Schedule · Logbook"]
    WEB --> UI
    DESK --> UI
  end

  UI --> API["Next.js API routes<br/>/projects /shifts /logs"]
  UI --> AIAPI["/api/ai/rewrite<br/>SpaceXAI optional"]

  subgraph INTEL["Intelligence layer target"]
    FA["FastAPI journal engine<br/>target"]
    NL["Ask Scaffy NL query<br/>target"]
    VOX["Voice → structured entry<br/>target"]
    FA --> NL
    FA --> VOX
  end

  API --> STORE["Local JSON / SQLite<br/>local-first store"]
  AIAPI --> XAI["xAI SpaceXAI<br/>opt-in live rewrite"]
  AIAPI --> OFF["Offline draft<br/>no network"]

  STORE -.->|explicit sync later| SB["Supabase optional<br/>auth + Postgres"]
  FA -.-> STORE

  subgraph SAFETY["Safety / HITL"]
    HITL["Human sign-off<br/>compliance · billing · send"]
    SOV["No silent exfil<br/>Te Mana Raraunga alignment"]
  end

  CREW --> HITL
  API --> SOV
  AIAPI --> SOV

  class WEB,DESK,UI client
  class API,FA api
  class AIAPI,NL,VOX,XAI,OFF ai
  class STORE,SB store
  class HITL,SOV hitl
```

## Data flow — log entry + AI tidy

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "fontSize": "14px",
    "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
    "primaryColor": "#0ea5e9",
    "primaryTextColor": "#f8fafc",
    "primaryBorderColor": "#38bdf8",
    "lineColor": "#94a3b8",
    "secondaryColor": "#1e293b"
  },
  "flowchart": { "curve": "basis", "useMaxWidth": true, "nodeSpacing": 28, "rankSpacing": 36 }
}}%%
flowchart LR

  classDef ui fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef api fill:#134e4a,stroke:#2dd4bf,stroke-width:2px,color:#f0fdfa
  classDef store fill:#1e1b4b,stroke:#a5b4fc,stroke-width:2px,color:#eef2ff
  classDef ai fill:#3b0764,stroke:#e879f9,stroke-width:2px,color:#fdf4ff

  A["Field notes<br/>work · issues · next"] --> B["Logbook UI"]
  B --> C["POST /api/logs"]
  C --> D["data/app-data.json<br/>never auto-uploaded"]
  B --> E["AI tidy notes"]
  E --> F{XAI_API_KEY?}
  F -->|no| G["Offline structured draft"]
  F -->|yes| H["api.x.ai rewrite<br/>opt-in live"]
  G --> B
  H --> B
  B --> I["Human saves log"]

  class A,B,I ui
  class C api
  class D store
  class E,F,G,H ai
```

## High-Level Architecture (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│  Next.js (Web + PWA)  +  Tauri 2 (Windows / Linux Desktop)  │
│  Tailwind + Ultra Glassmorphism UI                          │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS or local sidecar
┌────────────────────────────▼────────────────────────────────┐
│                  FastAPI Intelligent Layer                  │
│  • Journal CRUD                                             │
│  • Voice → structured entry                                 │
│  • Natural language query engine (“Ask Scaffy”)             │
│  • Report & compliance helpers                              │
│  • Optional local LLM / RAG                                 │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Local SQLite    Supabase       Future
        (Tauri /        (Auth +        Edge nodes
         browser)        Postgres +     (CAT stack)
                         Storage)
```

## Current State vs Target

| Layer              | Current (Grok Build)      | Target                                      |
|--------------------|---------------------------|---------------------------------------------|
| Frontend           | Next.js + Tailwind        | Keep + glassmorphism + Tauri                |
| Data               | JSON file                 | Local-first SQLite → optional Supabase      |
| Intelligence       | Simple AI rewrite         | FastAPI + full NL query engine              |
| Desktop            | None                      | Tauri 2                                     |
| Docs               | README + this file        | ARCHITECTURE + AGENTS + CAT_CONGRUENCE      |

## Data Model (Core)

### Implemented today (JSON store)

| Entity | Purpose |
|--------|---------|
| **Project** | Job site, client, status, notes |
| **Shift** | Roster entry linked to a project |
| **LogEntry** | Daily notebook: weather, height, inspection, work / issues / next steps |

### Target journal model (expansion)

**JournalEntry**
- id, user_id / crew_id
- date, site_address, gps (optional)
- client_or_builder
- description / scope_of_work
- workers_count
- ordinary_hours, overtime_hours
- travel_km
- compliance_notes (inspections, tags, defects, weather)
- photos[]
- raw_voice_transcript (optional)
- created_at, updated_at, device_id, sync_status

## Subscription Tiers

- **Free** → Local only, limited entries
- **Pro** → Unlimited personal + full voice + natural language
- **Crew** → Shared space + roles (up to 6)
- **Business** → Multi-crew, branding, API, priority support

## Standards for Every Build

- Prefer patterns already proven in Front_Line_Whanau
- Python for the intelligent layer
- TypeScript for the shell
- Explicit HITL on high-stakes changes
- No silent data exfiltration
- Keep this ARCHITECTURE.md updated when decisions change
