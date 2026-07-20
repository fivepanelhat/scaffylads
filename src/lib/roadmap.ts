/**
 * Roadmap summary for in-app UI.
 * Keep in sync with ROADMAP.md — checkboxes there are the source of truth for ticks.
 */

export type RoadmapItem = {
  id: string;
  label: string;
  done: boolean;
  note?: string;
};

export type RoadmapSection = {
  id: string;
  title: string;
  items: RoadmapItem[];
};

/** High-signal items for /architecture and /mission — full list in ROADMAP.md */
export const roadmapSections: RoadmapSection[] = [
  {
    id: "shipped",
    title: "Shipped now",
    items: [
      { id: "next-web", label: "Next.js web app (dashboard, projects, schedule, logbook)", done: true },
      { id: "api-routes", label: "Next.js API routes for CRUD + AI", done: true },
      { id: "dual-store", label: "JSON local store + optional Supabase Sydney", done: true },
      { id: "ask-scaffy", label: "Ask Scaffy NL (offline + optional SpaceXAI)", done: true },
      { id: "multimodal", label: "Text / paste / browser voice / file-name attach", done: true },
      { id: "vercel", label: "Vercel production deploy", done: true },
      { id: "mission", label: "Mission · 5 W’s · Te Mana / compliance docs", done: true },
    ],
  },
  {
    id: "next-up",
    title: "Next up (not built yet)",
    items: [
      { id: "sqlite", label: "SQLite local-first store", done: false, note: "Roadmap — not live" },
      { id: "fastapi", label: "FastAPI journal engine (Python brain)", done: false, note: "Roadmap — not live" },
      { id: "tauri", label: "Tauri 2 desktop", done: false, note: "Roadmap — not live" },
      { id: "pwa", label: "PWA offline shell", done: false },
      { id: "blobs", label: "Real photo/PDF attachment storage", done: false },
      { id: "extract", label: "Structured extraction (kms, OT, heights)", done: false },
      { id: "auth-rls", label: "Crew auth + tight Supabase RLS", done: false },
      { id: "export", label: "CSV / PDF export packs", done: false },
    ],
  },
];
