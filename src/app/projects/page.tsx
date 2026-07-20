import { ProjectsClient } from "./ProjectsClient";
import { PageHeader } from "@/components/PageHeader";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Projects"
        title="Job sites"
        lead="Track scaffolding jobs, clients, and site notes."
      />
      <ProjectsClient initialProjects={data.projects} />
    </div>
  );
}
