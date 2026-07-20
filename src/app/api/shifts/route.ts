import { NextResponse } from "next/server";
import { z } from "zod";
import { createShift, NotFoundError, readData, updateShift } from "@/lib/store";

/** See logs/route.ts - defaults are attached to the create schema only. */
const shiftFields = {
  projectId: z.string().min(1),
  title: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  crew: z.array(z.string()),
  status: z.enum(["scheduled", "in_progress", "done", "cancelled"]),
  notes: z.string(),
};

/** A shift ending before it starts would break every duration and sort. */
function endsAfterStart(v: { startsAt?: string; endsAt?: string }): boolean {
  if (!v.startsAt || !v.endsAt) return true; // edit touching only one side
  const start = Date.parse(v.startsAt);
  const end = Date.parse(v.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return true; // shape errors surface elsewhere
  return end > start;
}

const ORDER_ERROR = {
  message: "endsAt must be after startsAt",
  path: ["endsAt"],
};

const createShiftSchema = z
  .object({
    ...shiftFields,
    crew: shiftFields.crew.default([]),
    status: shiftFields.status.default("scheduled"),
    notes: shiftFields.notes.default(""),
  })
  .refine(endsAfterStart, ORDER_ERROR);

const updateShiftSchema = z
  .object(shiftFields)
  .partial()
  .extend({ id: z.string().min(1) })
  .refine(endsAfterStart, ORDER_ERROR);

export async function GET(req: Request) {
  const data = await readData();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  let shifts = data.shifts;
  if (projectId) shifts = shifts.filter((s) => s.projectId === projectId);
  shifts = [...shifts].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return NextResponse.json(shifts);
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
      const body = updateShiftSchema.parse(json);
      return NextResponse.json(await updateShift(body), { status: 200 });
    }
    const body = createShiftSchema.parse(json);
    return NextResponse.json(await createShift(body), { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid shift", issues: err.issues },
        { status: 400 },
      );
    }
    throw err;
  }
}
