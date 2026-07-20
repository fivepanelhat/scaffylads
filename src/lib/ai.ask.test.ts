import { describe, expect, it } from "vitest";
import { answerJournalOffline, journalContext } from "./ai";
import type { AppData } from "./types";

const sample: AppData = {
  projects: [
    {
      id: "p1",
      name: "Harbour View",
      siteAddress: "Quay St",
      client: "HB Ltd",
      status: "active",
      notes: "",
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
  ],
  shifts: [
    {
      id: "s1",
      projectId: "p1",
      title: "Erect level 3",
      startsAt: "2099-01-01T07:00:00.000Z",
      endsAt: "2099-01-01T15:00:00.000Z",
      crew: ["Tane", "Mia"],
      status: "scheduled",
      notes: "",
      createdAt: "2026-07-01T00:00:00.000Z",
    },
  ],
  logs: [
    {
      id: "l1",
      projectId: "p1",
      shiftId: "s1",
      date: "2026-07-20",
      author: "Site lead",
      weather: "overcast",
      maxHeightM: 9,
      inspectionDone: false,
      crewOnSite: ["Tane", "Mia"],
      workDone: "Handrail east elevation",
      issues: "Split board",
      nextSteps: "West tomorrow",
      createdAt: "2026-07-20T00:00:00.000Z",
      updatedAt: "2026-07-20T00:00:00.000Z",
    },
  ],
};

describe("Ask Scaffy offline", () => {
  it("counts active projects", () => {
    const text = answerJournalOffline("How many active projects?", sample);
    expect(text).toMatch(/1 project/);
    expect(text).toMatch(/Harbour View/);
  });

  it("flags open inspections", () => {
    const text = answerJournalOffline("Any open inspections?", sample);
    expect(text.toLowerCase()).toMatch(/pending|open/);
    expect(text).toMatch(/Harbour View/);
  });

  it("builds journal context for live mode", () => {
    const ctx = journalContext(sample);
    expect(ctx).toContain("Harbour View");
    expect(ctx).toContain("Erect level 3");
    expect(ctx).toContain("Handrail east");
  });
});
