import { LogbookClient } from "./LogbookClient";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LogbookPage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          Logbook
        </p>
        <h1 className="text-3xl font-bold">Daily site notebook</h1>
        <p className="mt-1 text-[var(--muted)]">
          Capture work, issues, inspections, and next steps. Use AI to tidy field notes.
        </p>
      </header>
      <LogbookClient
        initialLogs={data.logs}
        projects={data.projects}
        shifts={data.shifts}
      />
    </div>
  );
}
