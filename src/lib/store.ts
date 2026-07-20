import { isSupabaseConfigured } from "@/env";
import type { AppData, LogEntry, Project, Shift } from "./types";
import * as jsonStore from "./stores/json";
import type { CreateInput, PatchInput, Store } from "./stores/shared";

export { NotFoundError } from "./stores/shared";
export type { CreateInput, PatchInput } from "./stores/shared";
export { definedOnly } from "./stores/shared";

/**
 * Picks the storage backend.
 *
 * Supabase when it is configured, the local JSON file otherwise. The check
 * happens per call rather than at import time so tests and tooling can change
 * the environment without having to reset module state.
 *
 * The Supabase module is imported dynamically because it reaches for
 * next/headers, which is only valid inside a request. Keeping it out of the
 * import graph means the JSON path stays usable anywhere.
 */
async function store(): Promise<Store> {
  if (isSupabaseConfigured()) {
    return (await import("./stores/supabase")) as Store;
  }
  return jsonStore as Store;
}

/** Which backend is in use - surfaced in the UI so it is never a guess. */
export function activeBackend(): "supabase" | "local-json" {
  return isSupabaseConfigured() ? "supabase" : "local-json";
}

/**
 * Dashboard-friendly alias (main used "json" vs "local-json").
 * Prefer activeBackend() for new code.
 */
export function storageBackend(): "supabase" | "json" {
  return isSupabaseConfigured() ? "supabase" : "json";
}

export async function readData(): Promise<AppData> {
  return (await store()).readData();
}

export async function createProject(
  input: CreateInput<Project>,
): Promise<Project> {
  return (await store()).createProject(input);
}

export async function updateProject(
  input: PatchInput<Project>,
): Promise<Project> {
  return (await store()).updateProject(input);
}

export async function deleteProject(id: string): Promise<void> {
  return (await store()).deleteProject(id);
}

export async function createShift(input: CreateInput<Shift>): Promise<Shift> {
  return (await store()).createShift(input);
}

export async function updateShift(input: PatchInput<Shift>): Promise<Shift> {
  return (await store()).updateShift(input);
}

export async function createLog(
  input: CreateInput<LogEntry>,
): Promise<LogEntry> {
  return (await store()).createLog(input);
}

export async function updateLog(input: PatchInput<LogEntry>): Promise<LogEntry> {
  return (await store()).updateLog(input);
}
