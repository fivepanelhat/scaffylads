import { NextResponse } from "next/server";
import { z } from "zod";
import { readData, upsertShift } from "@/lib/store";

const shiftSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  title: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  crew: z.array(z.string()).default([]),
  status: z
    .enum(["scheduled", "in_progress", "done", "cancelled"])
    .default("scheduled"),
  notes: z.string().default(""),
});

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
  try {
    const body = shiftSchema.parse(await req.json());
    const shift = await upsertShift(body);
    return NextResponse.json(shift, { status: body.id ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid shift";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
