import { NextResponse } from "next/server";
import { z } from "zod";
import { AiUpstreamError, askScaffy } from "@/lib/ai";
import { readData } from "@/lib/store";

const schema = z.object({
  question: z.string().min(1).max(2000),
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
        { error: "Invalid ask request", issues: err.issues },
        { status: 400 },
      );
    }
    throw err;
  }

  try {
    const data = await readData();
    const result = await askScaffy(body.question, data);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiUpstreamError) {
      return NextResponse.json(
        { error: `AI provider unavailable: ${err.message}` },
        { status: 502 },
      );
    }
    throw err;
  }
}
