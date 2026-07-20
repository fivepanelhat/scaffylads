import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

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
});

function post(body: unknown): Request {
  return new Request("http://localhost/api/shifts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const BASE = {
  projectId: "p1",
  title: "Erect level 3 handrail",
  startsAt: "2026-07-20T07:00:00.000Z",
  endsAt: "2026-07-20T15:30:00.000Z",
};

describe("POST /api/shifts", () => {
  it("creates a valid shift", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ ...BASE, crew: ["Tane"] }));
    expect(res.status).toBe(201);
    const shift = await res.json();
    expect(shift.status).toBe("scheduled");
    expect(shift.crew).toEqual(["Tane"]);
  });

  it("rejects a shift that ends before it starts", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      post({
        ...BASE,
        startsAt: "2026-07-20T15:30:00.000Z",
        endsAt: "2026-07-20T07:00:00.000Z",
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid shift");
  });

  it("rejects a zero-length shift", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ ...BASE, endsAt: BASE.startsAt }));
    expect(res.status).toBe(400);
  });

  it("rejects an edit that would invert the times", async () => {
    const { POST } = await import("./route");
    const created = await (await POST(post(BASE))).json();
    const res = await POST(
      post({
        id: created.id,
        startsAt: "2026-07-20T18:00:00.000Z",
        endsAt: "2026-07-20T09:00:00.000Z",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("preserves crew and notes when an edit omits them", async () => {
    const { POST } = await import("./route");
    const created = await (
      await POST(post({ ...BASE, crew: ["Tane", "Mia"], notes: "Bring tags" }))
    ).json();

    const res = await POST(post({ id: created.id, status: "done" }));
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.status).toBe("done");
    expect(updated.crew).toEqual(["Tane", "Mia"]);
    expect(updated.notes).toBe("Bring tags");
  });

  it("answers 404 when editing a shift that does not exist", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ id: "missing", status: "done" }));
    expect(res.status).toBe(404);
  });
});
