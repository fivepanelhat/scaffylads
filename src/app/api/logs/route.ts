import { NextResponse } from "next/server";
import { z } from "zod";
import { createLog, NotFoundError, readData, updateLog } from "@/lib/store";

/**
 * Field shapes with no defaults attached.
 *
 * Defaults belong to creation only. Reusing a defaulted schema for edits
 * turns every omitted field into a silent overwrite - an edit that only
 * touched workDone would also clear the crew list and reset inspectionDone
 * to false, losing a recorded safety inspection.
 */
const logFields = {
  projectId: z.string().min(1),
  shiftId: z.string().optional(),
  date: z.string().min(1),
  author: z.string(),
  weather: z.enum(["clear", "overcast", "rain", "wind", "other"]),
  maxHeightM: z.number().optional(),
  inspectionDone: z.boolean(),
  crewOnSite: z.array(z.string()),
  workDone: z.string(),
  issues: z.string(),
  nextSteps: z.string(),
};

const createLogSchema = z.object({
  ...logFields,
  author: logFields.author.default("Site lead"),
  weather: logFields.weather.default("clear"),
  inspectionDone: logFields.inspectionDone.default(false),
  crewOnSite: logFields.crewOnSite.default([]),
  workDone: logFields.workDone.default(""),
  issues: logFields.issues.default(""),
  nextSteps: logFields.nextSteps.default(""),
});

const updateLogSchema = z
  .object(logFields)
  .partial()
  .extend({ id: z.string().min(1) });

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
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const isEdit =
    typeof json === "object" &&
    json !== null &&
    typeof (json as { id?: unknown }).id === "string";

  try {
    if (isEdit) {
      const body = updateLogSchema.parse(json);
      return NextResponse.json(await updateLog(body), { status: 200 });
    }
    const body = createLogSchema.parse(json);
    return NextResponse.json(await createLog(body), { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid log", issues: err.issues },
        { status: 400 },
      );
    }
    throw err;
  }
}
