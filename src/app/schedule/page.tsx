import { ScheduleClient } from "./ScheduleClient";
import { PageHeader } from "@/components/PageHeader";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Schedule"
        title="Work roster"
        lead="Plan crew shifts against active scaffolding jobs."
      />
      <ScheduleClient
        initialShifts={data.shifts}
        projects={data.projects}
      />
    </div>
  );
}
