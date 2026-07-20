"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry, Project, Shift, Weather } from "@/lib/types";

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function LogbookClient({
  initialLogs,
  projects,
  shifts,
}: {
  initialLogs: LogEntry[];
  projects: Project[];
  shifts: Shift[];
}) {
  const [logs, setLogs] = useState(initialLogs);
  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p])),
    [projects],
  );
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    shiftId: "",
    date: new Date().toISOString().slice(0, 10),
    author: "Site lead",
    weather: "overcast" as Weather,
    maxHeightM: "",
    inspectionDone: false,
    crewOnSite: "",
    workDone: "",
    issues: "",
    nextSteps: "",
    attachmentName: "",
  });
  const [pasteDump, setPasteDump] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<"live" | "offline" | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const projectShifts = shifts.filter((s) => s.projectId === form.projectId);

  function applyPasteDump() {
    if (!pasteDump.trim()) return;
    setForm((f) => ({
      ...f,
      workDone: f.workDone
        ? `${f.workDone}\n\n${pasteDump.trim()}`
        : pasteDump.trim(),
    }));
    setPasteDump("");
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Voice needs Chrome/Edge speech recognition in this browser.");
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-NZ";
    rec.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript || "";
      setForm((f) => ({
        ...f,
        workDone: f.workDone ? `${f.workDone} ${t}` : t,
      }));
    };
    rec.onerror = () => {
      setListening(false);
      setError("Voice recognition error — try again or type.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setError(null);
    setListening(true);
    rec.start();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        projectId: form.projectId,
        shiftId: form.shiftId || undefined,
        date: form.date,
        author: form.author,
        weather: form.weather,
        maxHeightM: form.maxHeightM ? Number(form.maxHeightM) : undefined,
        inspectionDone: form.inspectionDone,
        crewOnSite: form.crewOnSite
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        workDone: form.workDone,
        issues: form.issues,
        nextSteps: form.nextSteps,
      };
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setLogs((prev) => [data, ...prev]);
      setForm((f) => ({
        ...f,
        workDone: "",
        issues: "",
        nextSteps: "",
        maxHeightM: "",
        crewOnSite: "",
        inspectionDone: false,
        attachmentName: "",
      }));
      setPasteDump("");
      setAiDraft(null);
      setAiMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function rewriteWithAi() {
    setAiBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId,
          workDone: form.workDone,
          issues: form.issues,
          nextSteps: form.nextSteps,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI rewrite failed");
      setAiDraft(data.text);
      setAiMode(data.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed");
    } finally {
      setAiBusy(false);
    }
  }

  function applyAiDraft() {
    if (!aiDraft) return;
    // Split simple structured draft back into fields when possible
    const workMatch = aiDraft.match(
      /Work completed\s*([\s\S]*?)(?=Issues|$)/i,
    );
    const issuesMatch = aiDraft.match(/Issues\s*([\s\S]*?)(?=Next steps|$)/i);
    const nextMatch = aiDraft.match(/Next steps\s*([\s\S]*?)$/i);
    setForm((f) => ({
      ...f,
      workDone: workMatch?.[1]?.trim() || aiDraft,
      issues: issuesMatch?.[1]?.trim() || f.issues,
      nextSteps: nextMatch?.[1]?.trim() || f.nextSteps,
    }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={save} className="card card-pad space-y-3">
        <div className="card-head">
          <h2 className="card-title">New log entry</h2>
          <span className="badge">Multimodal</span>
        </div>

        <div className="mode-toolbar" role="group" aria-label="Capture modes">
          <button
            type="button"
            className={`btn ${listening ? "btn-ai" : ""}`}
            onClick={toggleVoice}
          >
            {listening ? "Stop voice" : "Voice → work done"}
          </button>
          <label className="btn file-btn">
            Photo / file note
            <input
              type="file"
              accept="image/*,.pdf,.txt"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setForm((prev) => ({
                  ...prev,
                  attachmentName: f.name,
                  workDone: prev.workDone
                    ? `${prev.workDone}\n\n[Attached: ${f.name}]`
                    : `[Attached: ${f.name}]`,
                }));
              }}
            />
          </label>
        </div>

        <div className="field">
          <label htmlFor="paste">Paste dump (WhatsApp / van notes)</label>
          <textarea
            id="paste"
            value={pasteDump}
            onChange={(e) => setPasteDump(e.target.value)}
            placeholder="Paste rough notes here, then Apply to work done…"
            rows={2}
          />
          <button
            type="button"
            className="btn"
            onClick={applyPasteDump}
            disabled={!pasteDump.trim()}
          >
            Apply paste → work done
          </button>
        </div>

        {form.attachmentName && (
          <p className="text-xs text-[var(--muted)]">
            Attachment noted: <strong>{form.attachmentName}</strong> (name stored
            in work notes; binary upload to vault is roadmap)
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="project">Project</label>
            <select
              id="project"
              required
              value={form.projectId}
              onChange={(e) =>
                setForm({ ...form, projectId: e.target.value, shiftId: "" })
              }
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="shift">Linked shift (optional)</label>
            <select
              id="shift"
              value={form.shiftId}
              onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
            >
              <option value="">None</option>
              {projectShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="weather">Weather</label>
            <select
              id="weather"
              value={form.weather}
              onChange={(e) =>
                setForm({ ...form, weather: e.target.value as Weather })
              }
            >
              <option value="clear">Clear</option>
              <option value="overcast">Overcast</option>
              <option value="rain">Rain</option>
              <option value="wind">Wind</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="height">Max height (m)</label>
            <input
              id="height"
              type="number"
              min={0}
              step={0.5}
              value={form.maxHeightM}
              onChange={(e) => setForm({ ...form, maxHeightM: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="inspect">Inspection</label>
            <select
              id="inspect"
              value={form.inspectionDone ? "yes" : "no"}
              onChange={(e) =>
                setForm({ ...form, inspectionDone: e.target.value === "yes" })
              }
            >
              <option value="no">Pending</option>
              <option value="yes">Done</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="crew">Crew on site (comma-separated)</label>
          <input
            id="crew"
            value={form.crewOnSite}
            onChange={(e) => setForm({ ...form, crewOnSite: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="work">Work done</label>
          <textarea
            id="work"
            value={form.workDone}
            onChange={(e) => setForm({ ...form, workDone: e.target.value })}
            placeholder="Rough field notes are fine…"
          />
        </div>
        <div className="field">
          <label htmlFor="issues">Issues</label>
          <textarea
            id="issues"
            value={form.issues}
            onChange={(e) => setForm({ ...form, issues: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="next">Next steps</label>
          <textarea
            id="next"
            value={form.nextSteps}
            onChange={(e) => setForm({ ...form, nextSteps: e.target.value })}
          />
        </div>

        {aiDraft && (
          <div className="rounded-xl border border-[var(--line)] bg-[#0a1020] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                AI draft{" "}
                <span className="badge">
                  {aiMode === "live"
                    ? "sent to api.x.ai"
                    : "offline · stayed on this device"}
                </span>
              </p>
              <button type="button" className="btn" onClick={applyAiDraft}>
                Apply to form
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-[var(--muted)]">
              {aiDraft}
            </pre>
          </div>
        )}

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ai"
            onClick={rewriteWithAi}
            disabled={aiBusy}
          >
            {aiBusy ? "Rewriting…" : "AI tidy (NL polish)"}
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy || !form.projectId}
          >
            {busy ? "Saving…" : "Save log entry"}
          </button>
          <a className="btn" href="/ask">
            Ask Scaffy
          </a>
        </div>

        {/*
          CAT_CONGRUENCE rule 1 / AGENTS.md rule 6: notes must never leave the
          device without the crew knowing. State it before they press the
          button, not only on the badge afterwards.
        */}
        <p className="text-xs text-[var(--muted)]">
          Offline by default — your notes stay on this device. If this install
          is configured with an xAI key, &ldquo;AI tidy notes&rdquo; sends the
          work, issues and next-steps text to <code>api.x.ai</code> to be
          rewritten. Nothing is sent when you save a log entry.
        </p>
      </form>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="card p-5 text-[var(--muted)]">No log entries yet.</div>
        ) : (
          logs.map((l) => (
            <article key={l.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">
                    {projectsById[l.projectId]?.name || "Project"}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {l.date} · {l.author} · {l.weather}
                    {l.maxHeightM != null ? ` · ${l.maxHeightM} m` : ""}
                  </p>
                </div>
                <span className="badge">
                  {l.inspectionDone ? "Inspected" : "Inspect pending"}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <strong>Work:</strong> {l.workDone || "—"}
                </p>
                <p>
                  <strong>Issues:</strong> {l.issues || "—"}
                </p>
                <p>
                  <strong>Next:</strong> {l.nextSteps || "—"}
                </p>
                {l.crewOnSite.length > 0 && (
                  <p className="text-[var(--muted)]">
                    Crew: {l.crewOnSite.join(", ")}
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
