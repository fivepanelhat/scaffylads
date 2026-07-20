import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { roadmapSections } from "@/lib/roadmap";

export const metadata = {
  title: "Architecture · ScaffyLads",
  description:
    "As-built ScaffyLads architecture and honest roadmap — FastAPI, SQLite, Tauri are not live yet.",
};

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Architecture"
        title="As built now"
        lead="What production actually runs today. FastAPI, SQLite, and Tauri are roadmap items — tick them in ROADMAP.md when they ship."
        action={
          <a
            className="btn"
            href="https://github.com/fivepanelhat/scaffylads/blob/main/ROADMAP.md"
            target="_blank"
            rel="noreferrer"
          >
            Open ROADMAP.md
          </a>
        }
      />

      <div className="truth-banner" role="note">
        <strong>Truth rule:</strong> this page and banner show the{" "}
        <em>live MVP</em> (Next.js API routes, dual JSON/Supabase store, Ask
        Scaffy in-process). Do not treat the old “FastAPI / vault.db / Tauri”
        art as shipped features.
      </div>

      <section className="hero-image-wrap" aria-label="As-built architecture overview">
        <Image
          src="/architecture_overview.png"
          alt="ScaffyLads as-built architecture — Next.js client, Next.js API intelligence, JSON and Supabase data"
          width={1280}
          height={720}
          priority
          className="hero-image"
        />
      </section>

      <section className="card card-pad space-y-3">
        <h2 className="card-title">Layers — current vs roadmap</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-4">Layer</th>
                <th className="py-2 pr-4">Shipped now</th>
                <th className="py-2">Roadmap (not live)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Client</td>
                <td className="py-2 pr-4">Next.js web (Vercel)</td>
                <td className="py-2">PWA offline shell · Tauri 2 desktop</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">API</td>
                <td className="py-2 pr-4">
                  Next.js route handlers (/projects, /shifts, /logs, /ai/*)
                </td>
                <td className="py-2">FastAPI journal engine (Python brain)</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Intelligence</td>
                <td className="py-2 pr-4">
                  Ask Scaffy + AI tidy in Next (offline + optional SpaceXAI)
                </td>
                <td className="py-2">
                  Structured extraction · local LLM · vision · FastAPI NL
                </td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Data</td>
                <td className="py-2 pr-4">
                  Local JSON dual-mode + optional Supabase Postgres (Sydney)
                </td>
                <td className="py-2">
                  SQLite local-first · blob vault · tight RLS + auth
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Safety</td>
                <td className="py-2 pr-4">
                  No silent AI exfil · key-gated live · Te Mana docs
                </td>
                <td className="py-2">
                  In-product HITL gates · audit log · residency toggle UI
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-pad space-y-3">
        <h2 className="card-title">System map (as built)</h2>
        <p className="text-sm text-[var(--muted)]">
          Mermaid of what runs in production today. Target diagrams stay in{" "}
          <a
            className="text-[var(--accent-2)] underline"
            href="https://github.com/fivepanelhat/scaffylads/blob/main/ARCHITECTURE.md"
            target="_blank"
            rel="noreferrer"
          >
            ARCHITECTURE.md
          </a>
          .
        </p>
        <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[#0a1020] p-4 text-xs leading-relaxed text-[var(--muted)]">
{`flowchart TB
  CREW[Crew / site lead] --> WEB[Next.js Web live]
  WEB --> UI[Dashboard · Projects · Schedule · Logbook · Ask · Mission]
  UI --> API[Next.js API routes]
  UI --> AI[/api/ai/rewrite · /api/ai/ask]
  API --> JSON[Local JSON store]
  API --> SB[Supabase Sydney optional]
  AI --> OFF[Offline draft / heuristics]
  AI -.->|if XAI_API_KEY| XAI[SpaceXAI api.x.ai]
  note1[Roadmap dashed: Tauri · FastAPI · SQLite]`}
        </pre>
      </section>

      {roadmapSections.map((section) => (
        <section key={section.id} className="card card-pad space-y-3">
          <h2 className="card-title">{section.title}</h2>
          <ul className="roadmap-list">
            {section.items.map((item) => (
              <li key={item.id} className={item.done ? "done" : "todo"}>
                <span className="roadmap-check" aria-hidden>
                  {item.done ? "✓" : "○"}
                </span>
                <span>
                  {item.label}
                  {item.note ? (
                    <span className="roadmap-note"> — {item.note}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {section.id === "next-up" ? (
            <p className="text-sm text-[var(--muted)]">
              Full checklist with more epics:{" "}
              <a
                className="text-[var(--accent-2)] underline"
                href="https://github.com/fivepanelhat/scaffylads/blob/main/ROADMAP.md"
                target="_blank"
                rel="noreferrer"
              >
                ROADMAP.md
              </a>
              . Tick boxes there as features land — no fixed dates.
            </p>
          ) : null}
        </section>
      ))}

      <Link href="/" className="btn btn-primary inline-flex">
        Back to dashboard
      </Link>
    </div>
  );
}
