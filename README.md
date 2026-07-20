# ScaffyLads

**AI-native work schedule and project notebook** for scaffolding crews.

Also known as *Scaffold Journal* — daily site logbooks, job tracking, and crew rostering with optional AI note tidy-up.

## Features

| Area | What it does |
|------|----------------|
| **Dashboard** | Today’s shifts, recent logs, active job counts |
| **Projects** | Job sites, clients, status, notes |
| **Schedule** | Crew shifts linked to projects |
| **Logbook** | Daily entries: weather, height, inspection, work / issues / next steps |
| **AI tidy** | Rewrites rough field notes via **SpaceXAI** (`XAI_API_KEY`) or offline draft |

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind
- File-backed JSON store (`data/app-data.json`, gitignored) — zero native DB deps for first run
- **Zod** validation on API routes
- **SpaceXAI / xAI** OpenAI-compatible client for log rewrites

## Quick start

```bash
git clone https://github.com/cuzzycomputers/scaffylads.git
cd scaffylads
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI (optional)

```bash
cp .env.example .env.local
# set XAI_API_KEY=... from https://console.x.ai
```

Without a key, **AI tidy notes** still works in offline mode (structured draft, no network).

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

## Product framing

- Built for **scaffolding / edge-protection** field work (NZ-friendly copy and units).
- Logs are designed for audit-friendly daily records, not legal advice.
- Agents/AI **draft only** — humans own site sign-off.

## Repo

https://github.com/cuzzycomputers/scaffylads

Maintained by **cuzzycomputers**.
