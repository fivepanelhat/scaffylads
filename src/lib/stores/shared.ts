import type { AppData, LogEntry, Project, Shift } from "../types";

/** Input accepted when creating a record. */
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

/**
 * Input accepted when editing a record.
 *
 * Every field bar the id is optional, so callers can send only what changed.
 * Keys that are absent - or explicitly undefined - leave the stored value
 * alone rather than reverting it to a schema default.
 */
export type PatchInput<T> = Partial<CreateInput<T>> & { id: string };

/**
 * Raised when an edit targets a record that is not in the store.
 *
 * Routes map this to 404 - editing a deleted job is a different failure from
 * sending a malformed body, and the client needs to tell them apart.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Drop keys whose value is undefined.
 *
 * Spreading a patch straight onto a stored record would let an explicit
 * `undefined` overwrite real data, so undefined is treated as "not supplied".
 */
export function definedOnly<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

/** The operations every storage backend must provide. */
export interface Store {
  readData(): Promise<AppData>;
  createProject(input: CreateInput<Project>): Promise<Project>;
  updateProject(input: PatchInput<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  createShift(input: CreateInput<Shift>): Promise<Shift>;
  updateShift(input: PatchInput<Shift>): Promise<Shift>;
  createLog(input: CreateInput<LogEntry>): Promise<LogEntry>;
  updateLog(input: PatchInput<LogEntry>): Promise<LogEntry>;
}
