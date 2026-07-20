/**
 * Product narrative for ScaffyLads — congruent with CAT fleet README 5W pattern
 * (Front_Line_Whanau), Te Mana Raraunga spirit, and AGENTS.md success criteria.
 */

export const fiveWs = [
  {
    w: "Who",
    title: "Who we serve",
    body: "Sole traders and small scaffolding crews across Aotearoa — site leads, board hands, estimators, and the office person who still does the logbook at night. Clients, accountants, and WorkSafe inspectors are secondary readers, not the daily user.",
  },
  {
    w: "What",
    title: "What we are",
    body: "An AI-native work journal and roster notebook: capture the day by voice, text, photo note, or paste; tidy with optional AI; query later in plain English (“Ask Scaffy”). Projects, shifts, and compliance-minded logs in one place.",
  },
  {
    w: "Why",
    title: "Why it exists",
    body: "Field notes die in van notebooks, group chats, and half-filled spreadsheets. Crews lose kms, OT, and inspection history when quotes and claims come due. ScaffyLads turns rough capture into clean records without forcing another enterprise suite.",
  },
  {
    w: "When",
    title: "When we ship",
    body: "Pre-seed MVP now (web + dual store). Voice, offline SQLite, Tauri desktop, and FastAPI “Ask Scaffy” depth land as progressive enhancement — core logging works today without cloud.",
  },
  {
    w: "Where",
    title: "Where it runs",
    body: "Nationwide Aotearoa as Web / PWA first, Tauri desktop next. Local-first on device; optional Supabase (Sydney Oceania) when the operator chooses sync. No silent offshore dump of journals.",
  },
] as const;

export const problems = [
  {
    title: "Fragmented capture",
    body: "Notes live in paper pads, WhatsApp, photos of whiteboards, and memory. By Friday the story of the week is gone.",
  },
  {
    title: "Compliance drag",
    body: "Inspection ticks, max heights, SWL, weather, and crew on site should be easy to prove. Today they are hard to find when WorkSafe or a client asks.",
  },
  {
    title: "Admin after dark",
    body: "The person who did the physical work should not spend another unpaid hour typing it up. Voice and natural language cut the tax.",
  },
  {
    title: "Data that walks away",
    body: "Cloud tools often ship journal content overseas by default. Crews deserve owner control and NZ-aligned residency choices.",
  },
  {
    title: "No way to ask the past",
    body: "“Travel kms for the last two sites” or “days on the Harbour job this year” should be answers, not archaeology through folders.",
  },
] as const;

export const solution = {
  headline: "The solution we’ve built",
  lead: "A local-first journal shell that already runs on Vercel + optional Supabase Sydney, with progressive AI and multimodal capture.",
  pillars: [
    {
      title: "Projects · shifts · logbook",
      body: "Job sites, crew rosters, and daily entries with inspection, height, weather, and next steps — structured enough for export, loose enough for the tools.",
    },
    {
      title: "Multimodal capture",
      body: "Type, paste rough notes, speak (browser voice), and attach a photo/note when the phone is muddy. AI tidy is opt-in and labelled live vs offline.",
    },
    {
      title: "Ask Scaffy (NL)",
      body: "Natural language questions over your own journal — offline answers from local data first; optional SpaceXAI when a key is set.",
    },
    {
      title: "Dual store",
      body: "JSON on disk for demos and air-gap; Supabase when env is set. Sync is progressive enhancement, never a silent default.",
    },
  ],
} as const;

export const multimodal = {
  headline: "Natural language & multimodal input",
  modes: [
    {
      id: "text",
      title: "Text",
      body: "Type field notes straight into the logbook. Short sentences are fine — polish later.",
    },
    {
      id: "paste",
      title: "Paste",
      body: "Dump a WhatsApp dump or van-note dump into work/issues/next steps and tidy with AI.",
    },
    {
      id: "voice",
      title: "Voice",
      body: "Browser speech-to-text into the same fields. Hands free on the scaffold when the site allows.",
    },
    {
      id: "photo",
      title: "Photo / file note",
      body: "Attach a site photo or PDF note to a log context. Vision extraction is on the roadmap; storage of the artefact starts now.",
    },
    {
      id: "ask",
      title: "Ask Scaffy",
      body: "“How many shifts this week?” “Any open inspections?” Plain English over your data.",
    },
  ],
} as const;

export const governance = {
  headline: "Security · compliance · governance · Te Mana",
  lead: "Aligned with Coastal Alpine Tech congruence: sovereign by default, HITL for high stakes, Te Mana Raraunga spirit.",
  items: [
    {
      title: "Security",
      points: [
        "No silent exfiltration of journal text",
        "Service-role keys server-only; never exposed to the browser",
        "AI live mode requires explicit operator key (XAI_API_KEY)",
        "TLS in transit on Vercel / Supabase; local JSON stays on the machine",
      ],
    },
    {
      title: "Compliance (NZ-first)",
      points: [
        "Privacy Act 2020 awareness — purpose-limited collection of crew/site notes",
        "WorkSafe-oriented fields (inspection, height, weather, crew on site)",
        "Export-ready records for IRD / clients (roadmap: PDF/CSV packs)",
        "Not a legal certification — counsel before regulated claims",
      ],
    },
    {
      title: "Governance & HITL",
      points: [
        "Human signs off compliance templates, billing, and production migrations",
        "Agents draft and tidy; humans save, send, and certify",
        "Change history via timestamps on projects and logs",
        "CAT congruence rules enforced in AGENTS.md for every build",
      ],
    },
    {
      title: "Te Mana Raraunga & Te Tiriti spirit",
      points: [
        "Treat operational data as taonga: owner-controlled and purpose-limited",
        "Local-first default; cloud residency preference Oceania (Sydney) when sync is on",
        "Transparent AI mode labels so crews know if text left the device",
        "Cultural safety: no training foundation models on private journals without consent",
      ],
    },
  ],
} as const;

export const exampleAsks = [
  "How many active projects do we have?",
  "What shifts are scheduled this week?",
  "Any open inspections in the logbook?",
  "Summarise today’s site notes",
  "Who is on the crew for Harbour View?",
  "Travel and height notes from the last log",
] as const;
