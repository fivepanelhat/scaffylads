import OpenAI from "openai";
import type { AppData } from "./types";

/** Where journal text is sent in live mode. Surfaced in the UI - see below. */
export const AI_PROVIDER_HOST = "api.x.ai";

/** Raised when the upstream model call fails, so routes can answer 502 not 400. */
export class AiUpstreamError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AiUpstreamError";
  }
}

/** Live calls are bounded so a hung provider cannot pin the request open. */
const AI_TIMEOUT_MS = 30_000;

/**
 * SpaceXAI / xAI (OpenAI-compatible).
 * Set XAI_API_KEY in .env.local for live rewrites.
 * Without a key, returns a deterministic offline draft.
 *
 * Sovereignty note (CAT_CONGRUENCE rule 1, AGENTS.md rule 6): in live mode the
 * raw notes leave the device for a third-party US endpoint. Offline mode is
 * the default precisely so this never happens without the operator opting in
 * by setting a key, and the UI labels which mode produced a draft.
 */
export async function rewriteLogEntry(input: {
  workDone: string;
  issues: string;
  nextSteps: string;
  projectName?: string;
}): Promise<{ text: string; mode: "live" | "offline" }> {
  const key = process.env.XAI_API_KEY;
  const prompt = [
    "You are a field notebook assistant for NZ scaffolding crews (ScaffyLads).",
    "Rewrite the rough site notes into a clear, professional daily logbook entry.",
    "Use plain English, short paragraphs, no fluff. Keep facts; do not invent heights, names, or incidents.",
    "Structure as: Work completed / Issues / Next steps.",
    input.projectName ? `Project: ${input.projectName}` : "",
    "",
    `Work done (raw): ${input.workDone || "(none)"}`,
    `Issues (raw): ${input.issues || "(none)"}`,
    `Next steps (raw): ${input.nextSteps || "(none)"}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!key) {
    return {
      mode: "offline",
      text: [
        "Work completed",
        input.workDone?.trim() || "No work notes recorded.",
        "",
        "Issues",
        input.issues?.trim() || "None reported.",
        "",
        "Next steps",
        input.nextSteps?.trim() || "TBC with site lead.",
        "",
        "(Offline AI draft — set XAI_API_KEY for SpaceXAI rewrite.)",
      ].join("\n"),
    };
  }

  const client = new OpenAI({
    apiKey: key,
    baseURL: `https://${AI_PROVIDER_HOST}/v1`,
    timeout: AI_TIMEOUT_MS,
  });

  const model = process.env.XAI_MODEL || "grok-4.5";

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You write concise scaffolding site logbook entries for New Zealand crews. Never invent safety incidents.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });
  } catch (err) {
    // A provider outage, bad key, or timeout is not the caller's fault - keep
    // it distinguishable from a malformed request so the route can say 502.
    throw new AiUpstreamError(
      err instanceof Error ? err.message : "AI provider request failed",
      err,
    );
  }

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new AiUpstreamError("AI provider returned an empty response");
  }
  return { mode: "live", text };
}

/** Compact journal snapshot for NL answers — no secrets, just operational facts. */
export function journalContext(data: AppData): string {
  const lines: string[] = [];
  lines.push(`Projects (${data.projects.length}):`);
  for (const p of data.projects.slice(0, 20)) {
    lines.push(
      `- [${p.status}] ${p.name} | client: ${p.client || "—"} | site: ${p.siteAddress || "—"} | id:${p.id}`,
    );
  }
  lines.push(`Shifts (${data.shifts.length}):`);
  for (const s of [...data.shifts]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 30)) {
    lines.push(
      `- [${s.status}] ${s.title} | project:${s.projectId} | ${s.startsAt} → ${s.endsAt} | crew: ${s.crew.join(", ") || "—"}`,
    );
  }
  lines.push(`Logs (${data.logs.length}):`);
  for (const l of [...data.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)) {
    lines.push(
      `- ${l.date} | project:${l.projectId} | inspect:${l.inspectionDone ? "done" : "pending"} | maxH:${l.maxHeightM ?? "—"} | weather:${l.weather}`,
    );
    if (l.workDone) lines.push(`  work: ${l.workDone.slice(0, 240)}`);
    if (l.issues) lines.push(`  issues: ${l.issues.slice(0, 160)}`);
    if (l.nextSteps) lines.push(`  next: ${l.nextSteps.slice(0, 160)}`);
    if (l.crewOnSite.length)
      lines.push(`  crew: ${l.crewOnSite.join(", ")}`);
  }
  return lines.join("\n");
}

/**
 * Offline NL answers over local journal facts (no network).
 * Heuristic only — live mode uses SpaceXAI with the same context.
 */
export function answerJournalOffline(
  question: string,
  data: AppData,
): string {
  const q = question.toLowerCase();
  const active = data.projects.filter((p) => p.status === "active");
  const openInspect = data.logs.filter((l) => !l.inspectionDone);
  const today = new Date().toISOString().slice(0, 10);
  const weekShifts = data.shifts.filter((s) => s.startsAt.slice(0, 10) >= today);

  if (/how many.*project|active project|number of project/.test(q)) {
    return `You have ${data.projects.length} project(s); ${active.length} active.\n${active.map((p) => `• ${p.name}`).join("\n") || "• (none active)"}`;
  }
  if (/shift|roster|schedule|this week|upcoming/.test(q)) {
    const list = weekShifts.length ? weekShifts : data.shifts.slice(0, 8);
    if (!list.length) return "No shifts found in the journal yet.";
    return `Shifts (${list.length} shown):\n${list
      .map((s) => {
        const proj = data.projects.find((p) => p.id === s.projectId)?.name || s.projectId;
        return `• ${s.title} — ${proj} — ${s.startsAt.slice(0, 16)} [${s.status}] crew: ${s.crew.join(", ") || "—"}`;
      })
      .join("\n")}`;
  }
  if (/inspect|worksafe|open inspect/.test(q)) {
    if (!openInspect.length)
      return "All recorded log entries mark inspection as done (or there are no logs yet).";
    return `Open / pending inspections (${openInspect.length}):\n${openInspect
      .map((l) => {
        const proj = data.projects.find((p) => p.id === l.projectId)?.name || l.projectId;
        return `• ${l.date} — ${proj} — height ${l.maxHeightM ?? "—"} m`;
      })
      .join("\n")}`;
  }
  if (/crew|who is on|harbour|who'?s on/.test(q)) {
    const hits = data.shifts.filter((s) => s.crew.length > 0).slice(0, 10);
    const fromLogs = data.logs.filter((l) => l.crewOnSite.length > 0).slice(0, 5);
    const lines = [
      ...hits.map((s) => `• Shift “${s.title}”: ${s.crew.join(", ")}`),
      ...fromLogs.map((l) => {
        const proj = data.projects.find((p) => p.id === l.projectId)?.name || l.projectId;
        return `• Log ${l.date} ${proj}: ${l.crewOnSite.join(", ")}`;
      }),
    ];
    return lines.length
      ? `Crew notes:\n${lines.join("\n")}`
      : "No crew names recorded on shifts or logs yet.";
  }
  if (/summar|today|last log|recent|note/.test(q)) {
    const recent = [...data.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!recent) return "No log entries yet — capture one in the Logbook.";
    const proj =
      data.projects.find((p) => p.id === recent.projectId)?.name || "Project";
    return [
      `Latest log — ${recent.date} — ${proj}`,
      `Work: ${recent.workDone || "—"}`,
      `Issues: ${recent.issues || "—"}`,
      `Next: ${recent.nextSteps || "—"}`,
      `Inspect: ${recent.inspectionDone ? "done" : "pending"} · max ${recent.maxHeightM ?? "—"} m · ${recent.weather}`,
    ].join("\n");
  }
  if (/height|max height|travel|km/.test(q)) {
    const withH = data.logs.filter((l) => l.maxHeightM != null);
    if (!withH.length)
      return "No max-height values in logs yet. Add them when you capture a site day.";
    return `Recorded max heights:\n${withH
      .slice(0, 12)
      .map((l) => {
        const proj = data.projects.find((p) => p.id === l.projectId)?.name || l.projectId;
        return `• ${l.date} ${proj}: ${l.maxHeightM} m`;
      })
      .join("\n")}\n\n(Travel kms are a planned field — note them in work done for now.)`;
  }

  // Generic offline brief
  return [
    "Offline Ask Scaffy (no XAI key — answered from local journal only).",
    "",
    `Projects: ${data.projects.length} (${active.length} active)`,
    `Shifts: ${data.shifts.length} · upcoming from today: ${weekShifts.length}`,
    `Logs: ${data.logs.length} · inspections pending: ${openInspect.length}`,
    "",
    "Try: “How many active projects?”, “What shifts this week?”, “Any open inspections?”, “Summarise the latest log”.",
    "",
    `Your question: ${question}`,
  ].join("\n");
}

/**
 * Ask Scaffy — natural language over journal context.
 * Offline by default; live uses SpaceXAI with the same local context.
 */
export async function askScaffy(
  question: string,
  data: AppData,
): Promise<{ text: string; mode: "live" | "offline" }> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { mode: "offline", text: "Ask something about your projects, shifts, or logs." };
  }

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return { mode: "offline", text: answerJournalOffline(trimmed, data) };
  }

  const context = journalContext(data);
  const client = new OpenAI({
    apiKey: key,
    baseURL: `https://${AI_PROVIDER_HOST}/v1`,
    timeout: AI_TIMEOUT_MS,
  });
  const model = process.env.XAI_MODEL || "grok-4.5";

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You are Ask Scaffy for ScaffyLads — NZ scaffolding crew journal assistant.",
            "Answer only from the JOURNAL CONTEXT. If the answer is not there, say so.",
            "Be concise, plain English, bullet points when listing. Do not invent kms, incidents, or names.",
            "Never claim data left the device; you only see the snapshot provided.",
          ].join(" "),
        },
        {
          role: "user",
          content: `JOURNAL CONTEXT:\n${context}\n\nQUESTION:\n${trimmed}`,
        },
      ],
      temperature: 0.2,
    });
  } catch (err) {
    throw new AiUpstreamError(
      err instanceof Error ? err.message : "AI provider request failed",
      err,
    );
  }

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new AiUpstreamError("AI provider returned an empty response");
  }
  return { mode: "live", text };
}

