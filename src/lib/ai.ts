import OpenAI from "openai";

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
