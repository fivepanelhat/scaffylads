import { NextResponse } from "next/server";
import { z } from "zod";
import { readData, upsertLog } from "@/lib/store";

const logSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  shiftId: z.string().optional(),
  date: z.string().min(1),
  author: z.string().default("Site lead"),
  weather: z
    .enum(["clear", "overcast", "rain", "wind", "other"])
    .default("clear"),
  maxHeightM: z.number().optional(),
  inspectionDone: z.boolean().default(false),
  crewOnSite: z.array(z.string()).default([]),
  workDone: z.string().default(""),
  issues: z.string().default(""),
  nextSteps: z.string().default(""),
});

export async function GET(req: Request) {
  const data = await readData();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  let logs = data.logs;
  if (projectId) logs = logs.filter((l) => l.projectId === projectId);
  logs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  try {
    const body = logSchema.parse(await req.json());
    const log = await upsertLog(body);
    return NextResponse.json(log, { status: body.id ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid log";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
