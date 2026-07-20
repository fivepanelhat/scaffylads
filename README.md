# ScaffyLads

<div align="center">

<svg width="100%" height="220" viewBox="0 0 1200 220" xmlns="http://www.w3.org/2000/svg" style="border-radius: 24px; overflow: hidden;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="50%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.18)"/>
      <stop offset="50%" style="stop-color:rgba(148,163,184,0.12)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.08)"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#38bdf8"/>
      <stop offset="50%" style="stop-color:#818cf8"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1200" height="220" fill="url(#bgGrad)"/>
  <circle cx="180" cy="60" r="90" fill="#38bdf8" opacity="0.15" filter="url(#blur)"/>
  <circle cx="980" cy="160" r="110" fill="#f97316" opacity="0.12" filter="url(#blur)"/>
  <circle cx="620" cy="40" r="70" fill="#818cf8" opacity="0.14" filter="url(#blur)"/>
  <rect x="40" y="28" width="1120" height="164" rx="28" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
  <rect x="42" y="30" width="1116" height="1" rx="1" fill="rgba(255,255,255,0.35)"/>
  <g opacity="0.18" stroke="#94a3b8" stroke-width="2" fill="none">
    <line x1="90" y1="60" x2="90" y2="160"/>
    <line x1="130" y1="60" x2="130" y2="160"/>
    <line x1="90" y1="90" x2="130" y2="90"/>
    <line x1="90" y1="130" x2="130" y2="130"/>
    <line x1="1070" y1="60" x2="1070" y2="160"/>
    <line x1="1110" y1="60" x2="1110" y2="160"/>
    <line x1="1070" y1="90" x2="1110" y2="90"/>
    <line x1="1070" y1="130" x2="1110" y2="130"/>
  </g>
  <text x="600" y="105" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="white" text-anchor="middle" filter="url(#softGlow)">ScaffyLads</text>
  <text x="600" y="148" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#cbd5e1" text-anchor="middle">AI Work Journal for Scaffolding &amp; Construction Crews</text>
  <rect x="480" y="165" width="240" height="3" rx="2" fill="url(#accent)"/>
</svg>

**Sovereign • Offline-first • Voice + Natural Language • Built for the tools**

</div>

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
