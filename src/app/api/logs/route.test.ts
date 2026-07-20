import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

/**
 * The store writes to `${cwd}/data`, so each test gets its own cwd and
 * therefore its own JSON file. Modules are re-imported per test so the
 * store picks the new path up.
 */
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
  return new Request("http://localhost/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function seedLog() {
  const { POST } = await import("./route");
  const res = await POST(
    post({
      projectId: "p1",
      date: "2026-07-20",
      author: "Hemi",
      weather: "rain",
      inspectionDone: true,
      crewOnSite: ["Tane", "Mia", "Josh"],
      workDone: "Handrail east elevation",
      issues: "Split board replaced",
      nextSteps: "Inspector Thursday",
    }),
  );
  expect(res.status).toBe(201);
  return res.json();
}

describe("POST /api/logs", () => {
  it("creates a log and applies defaults only on create", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ projectId: "p1", date: "2026-07-20" }));
    expect(res.status).toBe(201);
    const log = await res.json();
    expect(log.author).toBe("Site lead");
    expect(log.weather).toBe("clear");
    expect(log.inspectionDone).toBe(false);
    expect(log.crewOnSite).toEqual([]);
  });

  it("preserves untouched fields when an edit omits them", async () => {
    const created = await seedLog();
    const { POST } = await import("./route");

    // The crew edits only the work description.
    const res = await POST(
      post({ id: created.id, workDone: "Handrail complete" }),
    );
    expect(res.status).toBe(200);
    const updated = await res.json();

    expect(updated.workDone).toBe("Handrail complete");
    // Regression: these previously reverted to their schema defaults, which
    // silently erased a recorded safety inspection and the crew list.
    expect(updated.inspectionDone).toBe(true);
    expect(updated.crewOnSite).toEqual(["Tane", "Mia", "Josh"]);
    expect(updated.weather).toBe("rain");
    expect(updated.author).toBe("Hemi");
    expect(updated.issues).toBe("Split board replaced");
    expect(updated.nextSteps).toBe("Inspector Thursday");
  });

  it("does not wipe defaulted fields when an edit resends only the required ones", async () => {
    const created = await seedLog();
    const { POST } = await import("./route");

    // The shape the old API forced on clients: projectId and date were
    // required even for an edit, so a caller changing one field still had to
    // resend them - and everything it left out was reset to a default.
    const res = await POST(
      post({
        id: created.id,
        projectId: "p1",
        date: "2026-07-20",
        workDone: "Handrail complete",
      }),
    );
    expect(res.status).toBe(200);
    const updated = await res.json();

    expect(updated.inspectionDone).toBe(true);
    expect(updated.crewOnSite).toEqual(["Tane", "Mia", "Josh"]);
    expect(updated.issues).toBe("Split board replaced");
    expect(updated.weather).toBe("rain");
  });

  it("still applies an explicit false rather than treating it as absent", async () => {
    const created = await seedLog();
    const { POST } = await import("./route");
    const res = await POST(post({ id: created.id, inspectionDone: false }));
    expect(res.status).toBe(200);
    expect((await res.json()).inspectionDone).toBe(false);
  });

  it("answers 404 when editing a log that does not exist", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ id: "missing", workDone: "x" }));
    expect(res.status).toBe(404);
  });

  it("answers 400 for a malformed create", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ date: "2026-07-20" })); // no projectId
    expect(res.status).toBe(400);
  });
});
