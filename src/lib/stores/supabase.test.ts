import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These exercise the mapping layer against a stubbed client. They are not a
 * substitute for running against a real database - RLS in particular can only
 * be proven in Postgres - but they do lock in the behaviour that has already
 * caused a data-loss bug once on the JSON backend.
 */

type Captured = { table: string; op: string; payload?: unknown; id?: string };

let captured: Captured[];
let rowToReturn: Record<string, unknown> | null;

function stubClient() {
  const builder = (table: string) => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: (payload: unknown) => {
      captured.push({ table, op: "insert", payload });
      return {
        select: () => ({
          single: () => Promise.resolve({ data: rowToReturn, error: null }),
        }),
      };
    },
    update: (payload: unknown) => {
      captured.push({ table, op: "update", payload });
      return {
        eq: (_col: string, id: string) => {
          captured[captured.length - 1].id = id;
          return {
            select: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: rowToReturn, error: null }),
            }),
          };
        },
      };
    },
    delete: () => ({
      eq: (_col: string, id: string) => {
        captured.push({ table, op: "delete", id });
        return Promise.resolve({ error: null });
      },
    }),
  });

  return { from: (table: string) => builder(table) };
}

beforeEach(() => {
  captured = [];
  rowToReturn = {
    id: "log-1",
    project_id: "p1",
    shift_id: null,
    date: "2026-07-20",
    author: "Hemi",
    weather: "rain",
    max_height_m: 9,
    inspection_done: true,
    crew_on_site: ["Tane", "Mia"],
    work_done: "Handrail",
    issues: "Split board",
    next_steps: "Inspector Thu",
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
  vi.resetModules();
  vi.doMock("../supabase/server", () => ({
    createClient: async () => stubClient(),
  }));
});

afterEach(() => {
  vi.doUnmock("../supabase/server");
});

describe("supabase store", () => {
  it("omits untouched fields from an update instead of defaulting them", async () => {
    const { updateLog } = await import("./supabase");
    await updateLog({ id: "log-1", workDone: "Handrail complete" });

    const update = captured.find((c) => c.op === "update");
    expect(update?.table).toBe("logs");
    expect(update?.id).toBe("log-1");

    // Only the changed column is sent. If inspection_done or crew_on_site
    // appeared here, an edit would silently clear a safety inspection and the
    // crew list - the same bug that hit the JSON backend.
    expect(update?.payload).toEqual({ work_done: "Handrail complete" });
  });

  it("still sends an explicit false rather than dropping it", async () => {
    const { updateLog } = await import("./supabase");
    await updateLog({ id: "log-1", inspectionDone: false });

    const update = captured.find((c) => c.op === "update");
    expect(update?.payload).toEqual({ inspection_done: false });
  });

  it("never sends owner_id - the database assigns it", async () => {
    const { createLog } = await import("./supabase");
    await createLog({
      projectId: "p1",
      date: "2026-07-20",
      author: "Hemi",
      weather: "rain",
      inspectionDone: true,
      crewOnSite: ["Tane"],
      workDone: "x",
      issues: "",
      nextSteps: "",
    });

    const insert = captured.find((c) => c.op === "insert");
    expect(insert?.payload).not.toHaveProperty("owner_id");
  });

  it("maps snake_case rows back to the app's shape", async () => {
    const { updateLog } = await import("./supabase");
    const log = await updateLog({ id: "log-1", workDone: "x" });

    expect(log).toMatchObject({
      id: "log-1",
      projectId: "p1",
      inspectionDone: true,
      crewOnSite: ["Tane", "Mia"],
      maxHeightM: 9,
      nextSteps: "Inspector Thu",
    });
    // A null shift_id becomes undefined, not null.
    expect(log.shiftId).toBeUndefined();
  });

  it("reports a missing row as NotFoundError, not a crash", async () => {
    rowToReturn = null;
    const { updateLog } = await import("./supabase");
    const { NotFoundError } = await import("./shared");

    await expect(updateLog({ id: "gone", workDone: "x" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
