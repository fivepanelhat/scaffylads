# ScaffyLads

![ScaffyLads Banner](assets/social_preview.png)

---

### What is ScaffyLads?

ScaffyLads is a cross-platform AI-powered work journal purpose-built for scaffolding and construction professionals in Aotearoa New Zealand.

Capture the day by typing or speaking. Then ask questions in plain English:

- *“Travel kms for the last two job sites”*
- *“How many days did I work in Palmerston North this year?”*
- *“Overtime hours so far for [builder]”*
- *“Show compliance notes for the [site] scaffold”*

### Core Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js + React + TypeScript | Web + PWA |
| Desktop | Tauri 2 (planned) | Windows + Linux |
| Styling | Tailwind + Ultra Glassmorphism | Modern high-clarity UI |
| Backend / AI | FastAPI (Python) | Journal engine + NL queries |
| Data | Local-first → optional Supabase | Offline capable + sync |

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

### Where your data goes

Journal data is held in a local JSON store (`data/app-data.json`, gitignored).
It is never uploaded on save.

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

Built with care for the lads on the tools.  
Coastal Alpine Tech • Taranaki / Aotearoa
