"use client";

import { useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function ProjectsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState({
    name: "",
    siteAddress: "",
    client: "",
    status: "active" as ProjectStatus,
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setProjects((prev) => [data, ...prev]);
      setForm({
        name: "",
        siteAddress: "",
        client: "",
        status: "active",
        notes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete project and its shifts/logs?")) return;
    const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={save} className="card space-y-3 p-5">
        <h2 className="text-lg font-bold">Add project</h2>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Harbour View — edge protection"
          />
        </div>
        <div className="field">
          <label htmlFor="site">Site address</label>
          <input
            id="site"
            value={form.siteAddress}
            onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
            placeholder="Street, suburb, city"
          />
        </div>
        <div className="field">
          <label htmlFor="client">Client</label>
          <input
            id="client"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ProjectStatus })
            }
          >
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="complete">Complete</option>
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
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save project"}
        </button>
      </form>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="card p-5 text-[var(--muted)]">No projects yet.</div>
        ) : (
          projects.map((p) => (
            <article key={p.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {p.client || "No client"} · {p.siteAddress || "No address"}
                  </p>
                </div>
                <span className={`badge ${p.status}`}>{statusLabel(p.status)}</span>
              </div>
              {p.notes && (
                <p className="mt-2 text-sm text-[var(--muted)]">{p.notes}</p>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  className="btn"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
