import OpenAI from "openai";

/**
 * SpaceXAI / xAI (OpenAI-compatible).
 * Set XAI_API_KEY in .env.local for live rewrites.
 * Without a key, returns a deterministic offline draft.
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
    baseURL: "https://api.x.ai/v1",
  });

  const model = process.env.XAI_MODEL || "grok-4.5";
  const completion = await client.chat.completions.create({
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

  const text =
    completion.choices[0]?.message?.content?.trim() ||
    "AI returned empty output.";
  return { mode: "live", text };
}
