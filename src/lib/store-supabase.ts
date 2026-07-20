import { randomUUID } from "crypto";
import { getSupabase } from "./supabase";
import type { AppData, LogEntry, Project, Shift } from "./types";
import {
  NotFoundError,
  type CreateInput,
  type PatchInput,
  definedOnly,
} from "./store-types";

// Re-export helpers used by store.ts dual mode
export { NotFoundError } from "./store-types";

type DbProject = {
  id: string;
  name: string;
  site_address: string;
  client: string;
  status: Project["status"];
  notes: string;
  created_at: string;
  updated_at: string;
};

type DbShift = {
  id: string;
  project_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  crew: string[];
  status: Shift["status"];
  notes: string;
  created_at: string;
};

type DbLog = {
  id: string;
  project_id: string;
  shift_id: string | null;
  date: string;
  author: string;
  weather: LogEntry["weather"];
  max_height_m: number | null;
  inspection_done: boolean;
  crew_on_site: string[];
  work_done: string;
  issues: string;
  next_steps: string;
  created_at: string;
  updated_at: string;
};

function mapProject(r: DbProject): Project {
  return {
    id: r.id,
    name: r.name,
    siteAddress: r.site_address,
    client: r.client,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapShift(r: DbShift): Shift {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    crew: r.crew ?? [],
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

function mapLog(r: DbLog): LogEntry {
  return {
    id: r.id,
    projectId: r.project_id,
    shiftId: r.shift_id ?? undefined,
    date: r.date,
    author: r.author,
    weather: r.weather,
    maxHeightM: r.max_height_m ?? undefined,
    inspectionDone: r.inspection_done,
    crewOnSite: r.crew_on_site ?? [],
    workDone: r.work_done,
    issues: r.issues,
    nextSteps: r.next_steps,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function sbReadData(): Promise<AppData> {
  const sb = getSupabase();
  const [projects, shifts, logs] = await Promise.all([
    sb.from("projects").select("*").order("created_at", { ascending: false }),
    sb.from("shifts").select("*").order("starts_at", { ascending: true }),
    sb.from("logs").select("*").order("date", { ascending: false }),
  ]);
  if (projects.error) throw projects.error;
  if (shifts.error) throw shifts.error;
  if (logs.error) throw logs.error;
  return {
    projects: (projects.data as DbProject[]).map(mapProject),
    shifts: (shifts.data as DbShift[]).map(mapShift),
    logs: (logs.data as DbLog[]).map(mapLog),
  };
}

export async function sbCreateProject(
  input: CreateInput<Project>,
): Promise<Project> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const id = randomUUID();
  const { data, error } = await sb
    .from("projects")
    .insert({
      id,
      name: input.name,
      site_address: input.siteAddress,
      client: input.client,
      status: input.status,
      notes: input.notes,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapProject(data as DbProject);
}

export async function sbUpdateProject(
  input: PatchInput<Project>,
): Promise<Project> {
  const sb = getSupabase();
  const { id, ...patch } = input;
  const p = definedOnly(patch);
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (p.name !== undefined) row.name = p.name;
  if (p.siteAddress !== undefined) row.site_address = p.siteAddress;
  if (p.client !== undefined) row.client = p.client;
  if (p.status !== undefined) row.status = p.status;
  if (p.notes !== undefined) row.notes = p.notes;

  const { data, error } = await sb
    .from("projects")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Project not found");
  return mapProject(data as DbProject);
}

export async function sbCreateShift(input: CreateInput<Shift>): Promise<Shift> {
  const sb = getSupabase();
  const id = randomUUID();
  const { data, error } = await sb
    .from("shifts")
    .insert({
      id,
      project_id: input.projectId,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      crew: input.crew,
      status: input.status,
      notes: input.notes,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapShift(data as DbShift);
}

export async function sbUpdateShift(input: PatchInput<Shift>): Promise<Shift> {
  const sb = getSupabase();
  const { id, ...patch } = input;
  const p = definedOnly(patch);
  const row: Record<string, unknown> = {};
  if (p.projectId !== undefined) row.project_id = p.projectId;
  if (p.title !== undefined) row.title = p.title;
  if (p.startsAt !== undefined) row.starts_at = p.startsAt;
  if (p.endsAt !== undefined) row.ends_at = p.endsAt;
  if (p.crew !== undefined) row.crew = p.crew;
  if (p.status !== undefined) row.status = p.status;
  if (p.notes !== undefined) row.notes = p.notes;

  const { data, error } = await sb
    .from("shifts")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Shift not found");
  return mapShift(data as DbShift);
}

export async function sbCreateLog(
  input: CreateInput<LogEntry>,
): Promise<LogEntry> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const id = randomUUID();
  const { data, error } = await sb
    .from("logs")
    .insert({
      id,
      project_id: input.projectId,
      shift_id: input.shiftId ?? null,
      date: input.date,
      author: input.author,
      weather: input.weather,
      max_height_m: input.maxHeightM ?? null,
      inspection_done: input.inspectionDone,
      crew_on_site: input.crewOnSite,
      work_done: input.workDone,
      issues: input.issues,
      next_steps: input.nextSteps,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapLog(data as DbLog);
}

export async function sbUpdateLog(
  input: PatchInput<LogEntry>,
): Promise<LogEntry> {
  const sb = getSupabase();
  const { id, ...patch } = input;
  const p = definedOnly(patch);
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (p.projectId !== undefined) row.project_id = p.projectId;
  if (p.shiftId !== undefined) row.shift_id = p.shiftId ?? null;
  if (p.date !== undefined) row.date = p.date;
  if (p.author !== undefined) row.author = p.author;
  if (p.weather !== undefined) row.weather = p.weather;
  if (p.maxHeightM !== undefined) row.max_height_m = p.maxHeightM ?? null;
  if (p.inspectionDone !== undefined) row.inspection_done = p.inspectionDone;
  if (p.crewOnSite !== undefined) row.crew_on_site = p.crewOnSite;
  if (p.workDone !== undefined) row.work_done = p.workDone;
  if (p.issues !== undefined) row.issues = p.issues;
  if (p.nextSteps !== undefined) row.next_steps = p.nextSteps;

  const { data, error } = await sb
    .from("logs")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Log not found");
  return mapLog(data as DbLog);
}

export async function sbDeleteProject(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw error;
}
