import { ScheduleClient } from "./ScheduleClient";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          Schedule
        </p>
        <h1 className="text-3xl font-bold">Work roster</h1>
        <p className="mt-1 text-[var(--muted)]">
          Plan crew shifts against active scaffolding jobs.
        </p>
      </header>
      <ScheduleClient
        initialShifts={data.shifts}
        projects={data.projects}
      />
    </div>
  );
}
