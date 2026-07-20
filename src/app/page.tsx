import Image from "next/image";
import Link from "next/link";
import { readData, storageBackend } from "@/lib/store";
import { fmtDateTime, relativeDayLabel, statusLabel } from "@/lib/format";
import { problems, solution } from "@/lib/product-story";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await readData();
  const backend = storageBackend();
  const today = new Date().toISOString().slice(0, 10);
  const projectsById = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  const upcoming = [...data.shifts]
    .filter((s) => s.startsAt.slice(0, 10) >= today && s.status !== "cancelled")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);

  const recentLogs = [...data.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const activeProjects = data.projects.filter((p) => p.status === "active");

  return (
    <div className="space-y-7">
      {/* Fleet-style product hero: banner + glass CTA strip */}
      <section className="product-hero" aria-labelledby="hero-title">
        <div className="product-hero-media">
          <Image
            src="/social_preview.png"
            alt="ScaffyLads — AI work journal for scaffolding crews"
            width={1280}
            height={720}
            priority
            className="product-hero-image"
          />
          <div className="product-hero-fade" aria-hidden />
        </div>
        <div className="product-hero-panel">
          <div className="product-hero-copy">
            <p className="hero-kicker">ScaffyLads · Aotearoa</p>
            <h1 id="hero-title" className="hero-title">
              AI work journal for scaffolding crews
            </h1>
            <p className="hero-lead">
              Multimodal capture — text, paste, voice, photo notes. Ask Scaffy
              in plain English. Local-first with Te Mana Raraunga alignment;
              clean records for IRD, clients and WorkSafe.
            </p>
            <div className="hero-actions">
              <Link href="/logbook" className="btn btn-primary">
                New log entry
              </Link>
              <Link href="/ask" className="btn btn-ai">
                Ask Scaffy
              </Link>
              <Link href="/mission" className="btn">
                Mission · 5 W&apos;s
              </Link>
              <Link href="/schedule" className="btn">
                Schedule
              </Link>
            </div>
          </div>
          <div className="product-hero-meta">
            <span
              className={`store-pill ${backend === "supabase" ? "store-live" : "store-local"}`}
              title={
                backend === "supabase"
                  ? "Reading and writing Supabase (Sydney)"
                  : "Local JSON store — set Supabase env for production DB"
              }
            >
              {backend === "supabase" ? "Supabase · Sydney" : "Local JSON store"}
            </span>
          </div>
        </div>
      </section>

      <section className="mission-strip" aria-label="Problem and solution">
        <div className="card card-pad">
          <div className="card-head">
            <h2 className="card-title">Problems we solve</h2>
            <Link href="/mission" className="card-link">
              Full mission
            </Link>
          </div>
          <ul className="item-list">
            {problems.slice(0, 3).map((p) => (
              <li key={p.title} className="item-row">
                <p className="item-title">{p.title}</p>
                <p className="item-sub">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h2 className="card-title">{solution.headline}</h2>
            <Link href="/ask" className="card-link">
              Try NL
            </Link>
          </div>
          <p className="item-sub">{solution.lead}</p>
          <div className="mission-pill-row">
            <span className="mission-pill accent">Multimodal</span>
            <span className="mission-pill accent">Ask Scaffy</span>
            <span className="mission-pill">Local-first</span>
            <span className="mission-pill">Te Mana</span>
            <span className="mission-pill">HITL</span>
            <span className="mission-pill">Privacy Act</span>
          </div>
          <div className="hero-actions" style={{ marginTop: "1rem" }}>
            <Link href="/mission#governance" className="btn">
              Security &amp; governance
            </Link>
            <Link href="/mission#multimodal" className="btn">
              Capture modes
            </Link>
          </div>
        </div>
      </section>

      <section className="stat-grid" aria-label="Fleet snapshot">
        <Stat
          label="Active projects"
          value={String(activeProjects.length)}
          accent="amber"
        />
        <Stat
          label="Shifts scheduled"
          value={String(data.shifts.length)}
          accent="cyan"
        />
        <Stat
          label="Log entries"
          value={String(data.logs.length)}
          accent="ok"
        />
      </section>

      <section className="dash-grid">
        <div className="card card-pad">
          <div className="card-head">
            <h2 className="card-title">Upcoming shifts</h2>
            <Link href="/schedule" className="card-link">
              All schedule
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="empty-hint">No upcoming shifts.</p>
          ) : (
            <ul className="item-list">
              {upcoming.map((s) => (
                <li key={s.id} className="item-row">
                  <div className="item-row-main">
                    <div>
                      <p className="item-title">{s.title}</p>
                      <p className="item-sub">
                        {projectsById[s.projectId]?.name || "Unknown project"} ·{" "}
                        {relativeDayLabel(s.startsAt)} · {fmtDateTime(s.startsAt)}
                      </p>
                    </div>
                    <span className={`badge ${s.status}`}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                  {s.crew.length > 0 && (
                    <p className="item-meta">Crew: {s.crew.join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card card-pad">
          <div className="card-head">
            <h2 className="card-title">Recent logbook</h2>
            <Link href="/logbook" className="card-link">
              Open logbook
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="empty-hint">No logs yet.</p>
          ) : (
            <ul className="item-list">
              {recentLogs.map((l) => (
                <li key={l.id} className="item-row">
                  <div className="item-row-main">
                    <p className="item-title">
                      {projectsById[l.projectId]?.name || "Project"}
                    </p>
                    <span className="badge">{l.date}</span>
                  </div>
                  <p className="item-sub line-clamp-2">
                    {l.workDone || "No work notes"}
                  </p>
                  <p className="item-meta">
                    {l.inspectionDone ? "Inspection done" : "Inspection pending"}
                    {l.maxHeightM != null ? ` · max ${l.maxHeightM} m` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "amber" | "cyan" | "ok";
}) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
