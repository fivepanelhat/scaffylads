import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createProject,
  deleteProject,
  NotFoundError,
  readData,
  updateProject,
} from "@/lib/store";

/** See logs/route.ts - defaults are attached to the create schema only. */
const projectFields = {
  name: z.string().min(1),
  siteAddress: z.string(),
  client: z.string(),
  status: z.enum(["planned", "active", "on_hold", "complete"]),
  notes: z.string(),
};

const createProjectSchema = z.object({
  ...projectFields,
  siteAddress: projectFields.siteAddress.default(""),
  client: projectFields.client.default(""),
  status: projectFields.status.default("active"),
  notes: projectFields.notes.default(""),
});

const updateProjectSchema = z
  .object(projectFields)
  .partial()
  .extend({ id: z.string().min(1) });

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.projects);
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
      const body = updateProjectSchema.parse(json);
      return NextResponse.json(await updateProject(body), { status: 200 });
    }
    const body = createProjectSchema.parse(json);
    return NextResponse.json(await createProject(body), { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid project", issues: err.issues },
        { status: 400 },
      );
    }
    throw err;
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
