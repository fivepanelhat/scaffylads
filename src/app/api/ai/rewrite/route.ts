import { NextResponse } from "next/server";
import { z } from "zod";
import { AiUpstreamError, rewriteLogEntry } from "@/lib/ai";
import { readData } from "@/lib/store";

const schema = z.object({
  projectId: z.string().optional(),
  workDone: z.string().default(""),
  issues: z.string().default(""),
  nextSteps: z.string().default(""),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid rewrite request", issues: err.issues },
        { status: 400 },
      );
    }
    throw err;
  }

  try {
    let projectName: string | undefined;
    if (body.projectId) {
      const data = await readData();
      projectName = data.projects.find((p) => p.id === body.projectId)?.name;
    }
    const result = await rewriteLogEntry({
      workDone: body.workDone,
      issues: body.issues,
      nextSteps: body.nextSteps,
      projectName,
    });
    return NextResponse.json(result);
  } catch (err) {
    // The request was well-formed; the provider is what failed. Answering 400
    // here would tell the crew to fix notes that were never the problem.
    if (err instanceof AiUpstreamError) {
      return NextResponse.json(
        { error: `AI provider unavailable: ${err.message}` },
        { status: 502 },
      );
    }
    throw err;
  }
}
