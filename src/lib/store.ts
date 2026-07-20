import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { AppData, LogEntry, Project, Shift } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const seed = seedData();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

function seedData(): AppData {
  const now = new Date();
  const iso = now.toISOString();
  const projectId = randomUUID();
  const shiftId = randomUUID();
  const day = iso.slice(0, 10);

  const project: Project = {
    id: projectId,
    name: "Harbour View Apartments - Edge Protection",
    siteAddress: "12 Quay St, Auckland CBD",
    client: "Harbour Build Ltd",
    status: "active",
    notes: "Seed project for ScaffyLads demo. Replace with live jobs.",
    createdAt: iso,
    updatedAt: iso,
  };

  const shift: Shift = {
    id: shiftId,
    projectId,
    title: "Erect level 3 handrail + board out",
    startsAt: `${day}T07:00:00.000Z`,
    endsAt: `${day}T15:30:00.000Z`,
    crew: ["Tane", "Mia", "Josh"],
    status: "scheduled",
    notes: "Bring extra boards and tag kit.",
    createdAt: iso,
  };

  const log: LogEntry = {
    id: randomUUID(),
    projectId,
    shiftId,
    date: day,
    author: "Site lead",
    weather: "overcast",
    maxHeightM: 9,
    inspectionDone: true,
    crewOnSite: ["Tane", "Mia", "Josh"],
    workDone:
      "Completed first lift handrail on east elevation. Boards tagged green. Access ladder secured.",
    issues: "One split board replaced. Client gate code changed - note in van folder.",
    nextSteps: "West elevation handrail tomorrow. Book inspector for Thursday.",
    createdAt: iso,
    updatedAt: iso,
  };

  return { projects: [project], shifts: [shift], logs: [log] };
}

export async function readData(): Promise<AppData> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as AppData;
}

export async function writeData(data: AppData): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function upsertProject(
  input: Omit<Project, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<Project> {
  const data = await readData();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = data.projects.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new Error("Project not found");
    const updated: Project = {
      ...data.projects[idx],
      ...input,
      id: input.id,
      updatedAt: now,
    };
    data.projects[idx] = updated;
    await writeData(data);
    return updated;
  }
  const created: Project = {
    id: randomUUID(),
    name: input.name,
    siteAddress: input.siteAddress,
    client: input.client,
    status: input.status,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  data.projects.unshift(created);
  await writeData(data);
  return created;
}

export async function upsertShift(
  input: Omit<Shift, "id" | "createdAt"> & { id?: string },
): Promise<Shift> {
  const data = await readData();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = data.shifts.findIndex((s) => s.id === input.id);
    if (idx === -1) throw new Error("Shift not found");
    const updated: Shift = { ...data.shifts[idx], ...input, id: input.id };
    data.shifts[idx] = updated;
    await writeData(data);
    return updated;
  }
  const created: Shift = {
    id: randomUUID(),
    projectId: input.projectId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    crew: input.crew,
    status: input.status,
    notes: input.notes,
    createdAt: now,
  };
  data.shifts.unshift(created);
  await writeData(data);
  return created;
}

export async function upsertLog(
  input: Omit<LogEntry, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<LogEntry> {
  const data = await readData();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = data.logs.findIndex((l) => l.id === input.id);
    if (idx === -1) throw new Error("Log not found");
    const updated: LogEntry = {
      ...data.logs[idx],
      ...input,
      id: input.id,
      updatedAt: now,
    };
    data.logs[idx] = updated;
    await writeData(data);
    return updated;
  }
  const created: LogEntry = {
    id: randomUUID(),
    projectId: input.projectId,
    shiftId: input.shiftId,
    date: input.date,
    author: input.author,
    weather: input.weather,
    maxHeightM: input.maxHeightM,
    inspectionDone: input.inspectionDone,
    crewOnSite: input.crewOnSite,
    workDone: input.workDone,
    issues: input.issues,
    nextSteps: input.nextSteps,
    createdAt: now,
    updatedAt: now,
  };
  data.logs.unshift(created);
  await writeData(data);
  return created;
}

export async function deleteProject(id: string): Promise<void> {
  const data = await readData();
  data.projects = data.projects.filter((p) => p.id !== id);
  data.shifts = data.shifts.filter((s) => s.projectId !== id);
  data.logs = data.logs.filter((l) => l.projectId !== id);
  await writeData(data);
}
