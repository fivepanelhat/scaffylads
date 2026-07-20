import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { AppData, LogEntry, Project, Shift } from "./types";
import { isSupabaseEnabled } from "./supabase";
import {
  NotFoundError,
  type CreateInput,
  type PatchInput,
  definedOnly,
} from "./store-types";
import * as sb from "./store-supabase";

export { NotFoundError, type CreateInput, type PatchInput, definedOnly };

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

async function fsReadData(): Promise<AppData> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as AppData;
}

async function fsWriteData(data: AppData): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function readData(): Promise<AppData> {
  if (isSupabaseEnabled()) return sb.sbReadData();
  return fsReadData();
}

export async function writeData(data: AppData): Promise<void> {
  if (isSupabaseEnabled()) {
    throw new Error(
      "writeData is not supported with Supabase backend — use create/update helpers",
    );
  }
  await fsWriteData(data);
}

export async function createProject(
  input: CreateInput<Project>,
): Promise<Project> {
  if (isSupabaseEnabled()) return sb.sbCreateProject(input);
  const data = await fsReadData();
  const now = new Date().toISOString();
  const created: Project = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.projects.unshift(created);
  await fsWriteData(data);
  return created;
}

export async function updateProject(
  input: PatchInput<Project>,
): Promise<Project> {
  if (isSupabaseEnabled()) return sb.sbUpdateProject(input);
  const data = await fsReadData();
  const idx = data.projects.findIndex((p) => p.id === input.id);
  if (idx === -1) throw new NotFoundError("Project not found");
  const { id, ...patch } = input;
  const updated: Project = {
    ...data.projects[idx],
    ...definedOnly(patch),
    id,
    updatedAt: new Date().toISOString(),
  };
  data.projects[idx] = updated;
  await fsWriteData(data);
  return updated;
}

export async function createShift(input: CreateInput<Shift>): Promise<Shift> {
  if (isSupabaseEnabled()) return sb.sbCreateShift(input);
  const data = await fsReadData();
  const created: Shift = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.shifts.unshift(created);
  await fsWriteData(data);
  return created;
}

export async function updateShift(input: PatchInput<Shift>): Promise<Shift> {
  if (isSupabaseEnabled()) return sb.sbUpdateShift(input);
  const data = await fsReadData();
  const idx = data.shifts.findIndex((s) => s.id === input.id);
  if (idx === -1) throw new NotFoundError("Shift not found");
  const { id, ...patch } = input;
  const updated: Shift = {
    ...data.shifts[idx],
    ...definedOnly(patch),
    id,
  };
  data.shifts[idx] = updated;
  await fsWriteData(data);
  return updated;
}

export async function createLog(input: CreateInput<LogEntry>): Promise<LogEntry> {
  if (isSupabaseEnabled()) return sb.sbCreateLog(input);
  const data = await fsReadData();
  const now = new Date().toISOString();
  const created: LogEntry = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.logs.unshift(created);
  await fsWriteData(data);
  return created;
}

export async function updateLog(input: PatchInput<LogEntry>): Promise<LogEntry> {
  if (isSupabaseEnabled()) return sb.sbUpdateLog(input);
  const data = await fsReadData();
  const idx = data.logs.findIndex((l) => l.id === input.id);
  if (idx === -1) throw new NotFoundError("Log not found");
  const { id, ...patch } = input;
  const updated: LogEntry = {
    ...data.logs[idx],
    ...definedOnly(patch),
    id,
    updatedAt: new Date().toISOString(),
  };
  data.logs[idx] = updated;
  await fsWriteData(data);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  if (isSupabaseEnabled()) return sb.sbDeleteProject(id);
  const data = await fsReadData();
  data.projects = data.projects.filter((p) => p.id !== id);
  data.shifts = data.shifts.filter((s) => s.projectId !== id);
  data.logs = data.logs.filter((l) => l.projectId !== id);
  await fsWriteData(data);
}

/** Which backend is active (for status UI / debugging). */
export function storageBackend(): "supabase" | "json" {
  return isSupabaseEnabled() ? "supabase" : "json";
}
