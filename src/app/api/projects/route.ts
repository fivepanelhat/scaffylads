import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteProject, readData, upsertProject } from "@/lib/store";

const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  siteAddress: z.string().default(""),
  client: z.string().default(""),
  status: z.enum(["planned", "active", "on_hold", "complete"]).default("active"),
  notes: z.string().default(""),
});

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.projects);
}

export async function POST(req: Request) {
  try {
    const body = projectSchema.parse(await req.json());
    const project = await upsertProject(body);
    return NextResponse.json(project, { status: body.id ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid project";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await deleteProject(id);
  return NextResponse.json({ ok: true });
}
