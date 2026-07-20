import { LogbookClient } from "./LogbookClient";
import { PageHeader } from "@/components/PageHeader";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LogbookPage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Logbook"
        title="Daily site notebook"
        lead="Capture work, issues, inspections, and next steps. Use AI to tidy field notes."
      />
      <LogbookClient
        initialLogs={data.logs}
        projects={data.projects}
        shifts={data.shifts}
      />
    </div>
  );
}
