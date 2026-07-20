import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const ORIGINAL_KEY = process.env.XAI_API_KEY;
let dir: string;
let cwd: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "scaffylads-"));
  cwd = vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.resetModules();
});

afterEach(async () => {
  cwd.mockRestore();
  await rm(dir, { recursive: true, force: true });
  if (ORIGINAL_KEY === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = ORIGINAL_KEY;
  vi.unstubAllGlobals();
});

function post(body: unknown): Request {
  return new Request("http://localhost/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/rewrite", () => {
  it("returns an offline draft when no key is configured", async () => {
    delete process.env.XAI_API_KEY;
    const { POST } = await import("./route");
    const res = await POST(post({ workDone: "Boarded level 2" }));
    expect(res.status).toBe(200);
    expect((await res.json()).mode).toBe("offline");
  });

  it("answers 400 when the body is not valid JSON", async () => {
    const { POST } = await import("./route");
    const bad = new Request("http://localhost/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    expect((await POST(bad)).status).toBe(400);
  });

  it("answers 400 when a field has the wrong type", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ workDone: 42 }));
    expect(res.status).toBe(400);
  });

  it("answers 502 - not 400 - when the provider is unreachable", async () => {
    process.env.XAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connect ECONNREFUSED");
      }),
    );
    const { POST } = await import("./route");
    const res = await POST(post({ workDone: "Boarded level 2" }));
    // Regression: this used to report 400, blaming the crew's notes for an
    // outage they had no control over.
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("AI provider unavailable");
  });
});
