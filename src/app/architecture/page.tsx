import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Architecture · ScaffyLads",
  description: "Target product architecture and system maps for ScaffyLads.",
};

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          Architecture
        </p>
        <h1 className="text-3xl font-bold">System design maps</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Engineering design for the pre-seed product — local-first journal,
          optional AI tidy, and target FastAPI / Tauri layers. Not a claim of
          fleet deployment.
        </p>
        <p className="mt-2 text-sm">
          Full source of truth:{" "}
          <a
            className="text-[var(--accent-2)] underline"
            href="https://github.com/fivepanelhat/scaffylads/blob/main/ARCHITECTURE.md"
            target="_blank"
            rel="noreferrer"
          >
            ARCHITECTURE.md
          </a>
        </p>
      </header>

      <section className="hero-image-wrap" aria-label="Architecture overview diagram">
        <Image
          src="/architecture_overview.png"
          alt="ScaffyLads architecture overview — client, intelligence, and data layers"
          width={1280}
          height={720}
          priority
          className="hero-image"
        />
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-bold">System map (Mermaid)</h2>
        <p className="text-sm text-[var(--muted)]">
          Rendered on GitHub from README / ARCHITECTURE.md. Summary below.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[#0a1020] p-4 text-xs leading-relaxed text-[var(--muted)]">
{`flowchart TB
  CREW --> WEB[Next.js Web + PWA]
  CREW --> DESK[Tauri 2 planned]
  WEB --> UI[Dashboard · Projects · Schedule · Logbook]
  DESK --> UI
  UI --> API[/projects /shifts /logs]
  UI --> AI[/api/ai/rewrite SpaceXAI opt-in]
  API --> STORE[Local JSON / SQLite]
  AI --> XAI[Live rewrite] & OFF[Offline draft]
  STORE -.-> SB[Supabase optional]
  CREW --> HITL[Human sign-off]`}
        </pre>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-bold">Layers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-4">Layer</th>
                <th className="py-2 pr-4">Current</th>
                <th className="py-2">Target</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Client</td>
                <td className="py-2 pr-4">Next.js web</td>
                <td className="py-2">Web + PWA + Tauri desktop</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Data</td>
                <td className="py-2 pr-4">Local JSON store</td>
                <td className="py-2">SQLite local-first → optional Supabase</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-semibold">Intelligence</td>
                <td className="py-2 pr-4">AI rewrite (opt-in)</td>
                <td className="py-2">FastAPI + Ask Scaffy NL + voice</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Safety</td>
                <td className="py-2 pr-4">No silent upload</td>
                <td className="py-2">HITL for compliance / billing / send</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link href="/" className="btn btn-primary inline-flex">
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
