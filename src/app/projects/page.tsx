import { ProjectsClient } from "./ProjectsClient";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const data = await readData();
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          Projects
        </p>
        <h1 className="text-3xl font-bold">Job sites</h1>
        <p className="mt-1 text-[var(--muted)]">
          Track scaffolding jobs, clients, and site notes.
        </p>
      </header>
      <ProjectsClient initialProjects={data.projects} />
    </div>
  );
}
