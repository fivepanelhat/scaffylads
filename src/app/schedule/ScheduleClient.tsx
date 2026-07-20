"use client";

import { useMemo, useState } from "react";
import type { Project, Shift, ShiftStatus } from "@/lib/types";
import { fmtDateTime, statusLabel } from "@/lib/format";

export function ScheduleClient({
  initialShifts,
  projects,
}: {
  initialShifts: Shift[];
  projects: Project[];
}) {
  const [shifts, setShifts] = useState(initialShifts);
  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p])),
    [projects],
  );
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    title: "",
    startsAt: "",
    endsAt: "",
    crew: "",
    status: "scheduled" as ShiftStatus,
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...shifts].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [shifts],
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        crew: form.crew
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : new Date().toISOString(),
        endsAt: form.endsAt
          ? new Date(form.endsAt).toISOString()
          : new Date().toISOString(),
      };
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setShifts((prev) => [data, ...prev]);
      setForm((f) => ({
        ...f,
        title: "",
        startsAt: "",
        endsAt: "",
        crew: "",
        notes: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={save} className="card space-y-3 p-5">
        <h2 className="text-lg font-bold">Add shift</h2>
        <div className="field">
          <label htmlFor="project">Project</label>
          <select
            id="project"
            required
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            {projects.length === 0 && <option value="">No projects</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Erect level 2 boards"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="start">Starts</label>
            <input
              id="start"
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="end">Ends</label>
            <input
              id="end"
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="crew">Crew (comma-separated)</label>
          <input
            id="crew"
            value={form.crew}
            onChange={(e) => setForm({ ...form, crew: e.target.value })}
            placeholder="Tane, Mia, Josh"
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ShiftStatus })
            }
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy || !form.projectId}>
          {busy ? "Saving…" : "Save shift"}
        </button>
      </form>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="card p-5 text-[var(--muted)]">No shifts yet.</div>
        ) : (
          sorted.map((s) => (
            <article key={s.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {projectsById[s.projectId]?.name || "Project"} ·{" "}
                    {fmtDateTime(s.startsAt)} – {fmtDateTime(s.endsAt)}
                  </p>
                </div>
                <span className={`badge ${s.status}`}>
                  {statusLabel(s.status)}
                </span>
              </div>
              {s.crew.length > 0 && (
                <p className="mt-2 text-sm">Crew: {s.crew.join(", ")}</p>
              )}
              {s.notes && (
                <p className="mt-1 text-sm text-[var(--muted)]">{s.notes}</p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
