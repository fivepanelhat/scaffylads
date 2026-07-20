import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_KEY = process.env.XAI_API_KEY;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = ORIGINAL_KEY;
  vi.unstubAllGlobals();
});

describe("rewriteLogEntry", () => {
  it("stays offline and keeps notes on-device when no key is set", async () => {
    delete process.env.XAI_API_KEY;
    const { rewriteLogEntry } = await import("./ai");
    const res = await rewriteLogEntry({
      workDone: "Boarded level 2",
      issues: "",
      nextSteps: "",
    });
    expect(res.mode).toBe("offline");
    expect(res.text).toContain("Boarded level 2");
  });

  it("fills the offline draft with placeholders rather than blanks", async () => {
    delete process.env.XAI_API_KEY;
    const { rewriteLogEntry } = await import("./ai");
    const res = await rewriteLogEntry({
      workDone: "",
      issues: "",
      nextSteps: "",
    });
    expect(res.text).toContain("No work notes recorded.");
    expect(res.text).toContain("None reported.");
  });

  it("raises AiUpstreamError when the provider fails", async () => {
    process.env.XAI_API_KEY = "test-key";
    // Fail at the transport layer so no real request leaves the machine.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connect ECONNREFUSED");
      }),
    );
    const { rewriteLogEntry, AiUpstreamError } = await import("./ai");
    await expect(
      rewriteLogEntry({ workDone: "x", issues: "", nextSteps: "" }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  });
});
