import { NextResponse } from "next/server";
import { z } from "zod";
import { rewriteLogEntry } from "@/lib/ai";
import { readData } from "@/lib/store";

const schema = z.object({
  projectId: z.string().optional(),
  workDone: z.string().default(""),
  issues: z.string().default(""),
  nextSteps: z.string().default(""),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
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
    const message = err instanceof Error ? err.message : "AI rewrite failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
