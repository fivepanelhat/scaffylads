import Link from "next/link";
import { readData } from "@/lib/store";
import { fmtDateTime, relativeDayLabel, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await readData();
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
    <div className="space-y-6">
      <section className="card p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Scaffold Journal
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          AI-native work schedule and project notebook for scaffolding crews.
          Capture site logs, roster shifts, and keep every job auditable.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/logbook" className="btn btn-primary">
            New log entry
          </Link>
          <Link href="/schedule" className="btn">
            View schedule
          </Link>
          <Link href="/projects" className="btn">
            Manage projects
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active projects" value={String(activeProjects.length)} />
        <Stat label="Shifts scheduled" value={String(data.shifts.length)} />
        <Stat label="Log entries" value={String(data.logs.length)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Upcoming shifts</h2>
            <Link href="/schedule" className="text-sm text-[var(--accent-2)]">
              All schedule
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No upcoming shifts.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-[var(--line)] bg-[#0a1020] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {projectsById[s.projectId]?.name || "Unknown project"} ·{" "}
                        {relativeDayLabel(s.startsAt)} · {fmtDateTime(s.startsAt)}
                      </p>
                    </div>
                    <span className={`badge ${s.status}`}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                  {s.crew.length > 0 && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Crew: {s.crew.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent logbook</h2>
            <Link href="/logbook" className="text-sm text-[var(--accent-2)]">
              Open logbook
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No logs yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentLogs.map((l) => (
                <li
                  key={l.id}
                  className="rounded-xl border border-[var(--line)] bg-[#0a1020] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {projectsById[l.projectId]?.name || "Project"}
                    </p>
                    <span className="badge">{l.date}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {l.workDone || "No work notes"}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
