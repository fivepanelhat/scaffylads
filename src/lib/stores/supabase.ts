import { createClient } from "../supabase/server";
import type { AppData, LogEntry, Project, Shift } from "../types";
import {
  definedOnly,
  NotFoundError,
  type CreateInput,
  type PatchInput,
} from "./shared";

/**
 * Postgres-backed store.
 *
 * Every query runs under RLS as the signed-in user, so none of these
 * functions filter by owner themselves - the database does it. owner_id
 * defaults to auth.uid() on insert, so it is never sent from here and
 * cannot be forged. See supabase/migrations/0001_scaffylads_core.sql.
 */

// The DB is snake_case, the app is camelCase. Mapping lives here so the rest
// of the codebase never sees a column name.

type ProjectRow = {
  id: string;
  name: string;
  site_address: string;
  client: string;
  status: Project["status"];
  notes: string;
  created_at: string;
  updated_at: string;
};

type ShiftRow = {
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

type LogRow = {
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

const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  siteAddress: r.site_address,
  client: r.client,
  status: r.status,
  notes: r.notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toShift = (r: ShiftRow): Shift => ({
  id: r.id,
  projectId: r.project_id,
  title: r.title,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  crew: r.crew,
  status: r.status,
  notes: r.notes,
  createdAt: r.created_at,
});

const toLog = (r: LogRow): LogEntry => ({
  id: r.id,
  projectId: r.project_id,
  shiftId: r.shift_id ?? undefined,
  date: r.date,
  author: r.author,
  weather: r.weather,
  maxHeightM: r.max_height_m ?? undefined,
  inspectionDone: r.inspection_done,
  crewOnSite: r.crew_on_site,
  workDone: r.work_done,
  issues: r.issues,
  nextSteps: r.next_steps,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/** camelCase patch -> snake_case columns, dropping keys that were not sent. */
function projectColumns(p: Partial<CreateInput<Project>>) {
  const c = definedOnly(p);
  return definedOnly({
    name: c.name,
    site_address: c.siteAddress,
    client: c.client,
    status: c.status,
    notes: c.notes,
  });
}

function shiftColumns(p: Partial<CreateInput<Shift>>) {
  const c = definedOnly(p);
  return definedOnly({
    project_id: c.projectId,
    title: c.title,
    starts_at: c.startsAt,
    ends_at: c.endsAt,
    crew: c.crew,
    status: c.status,
    notes: c.notes,
  });
}

function logColumns(p: Partial<CreateInput<LogEntry>>) {
  const c = definedOnly(p);
  return definedOnly({
    project_id: c.projectId,
    shift_id: c.shiftId,
    date: c.date,
    author: c.author,
    weather: c.weather,
    max_height_m: c.maxHeightM,
    inspection_done: c.inspectionDone,
    crew_on_site: c.crewOnSite,
    work_done: c.workDone,
    issues: c.issues,
    next_steps: c.nextSteps,
  });
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase ${what} failed: ${error.message}`);
}

/**
 * An update that matches no row is indistinguishable from one the caller is
 * not allowed to see - RLS filters it out either way. Both are reported as
 * not-found rather than leaking whether the id exists for someone else.
 */
function requireRow<T>(row: T | null, label: string): T {
  if (!row) throw new NotFoundError(`${label} not found`);
  return row;
}

export async function readData(): Promise<AppData> {
  const supabase = await createClient();

  const [projects, shifts, logs] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("shifts").select("*").order("starts_at", { ascending: true }),
    supabase.from("logs").select("*").order("date", { ascending: false }),
  ]);

  if (projects.error) fail("projects read", projects.error);
  if (shifts.error) fail("shifts read", shifts.error);
  if (logs.error) fail("logs read", logs.error);

  return {
    projects: (projects.data as ProjectRow[]).map(toProject),
    shifts: (shifts.data as ShiftRow[]).map(toShift),
    logs: (logs.data as LogRow[]).map(toLog),
  };
}

export async function createProject(
  input: CreateInput<Project>,
): Promise<Project> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(projectColumns(input))
    .select()
    .single();
  if (error) fail("project insert", error);
  return toProject(data as ProjectRow);
}

export async function updateProject(
  input: PatchInput<Project>,
): Promise<Project> {
  const { id, ...patch } = input;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(projectColumns(patch))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("project update", error);
  return toProject(requireRow(data as ProjectRow | null, "Project"));
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  // Shifts and logs go with it via ON DELETE CASCADE.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) fail("project delete", error);
}

export async function createShift(input: CreateInput<Shift>): Promise<Shift> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .insert(shiftColumns(input))
    .select()
    .single();
  if (error) fail("shift insert", error);
  return toShift(data as ShiftRow);
}

export async function updateShift(input: PatchInput<Shift>): Promise<Shift> {
  const { id, ...patch } = input;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .update(shiftColumns(patch))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("shift update", error);
  return toShift(requireRow(data as ShiftRow | null, "Shift"));
}

export async function createLog(
  input: CreateInput<LogEntry>,
): Promise<LogEntry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .insert(logColumns(input))
    .select()
    .single();
  if (error) fail("log insert", error);
  return toLog(data as LogRow);
}

export async function updateLog(
  input: PatchInput<LogEntry>,
): Promise<LogEntry> {
  const { id, ...patch } = input;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .update(logColumns(patch))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("log update", error);
  return toLog(requireRow(data as LogRow | null, "Log"));
}
