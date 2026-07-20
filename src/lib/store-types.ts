/**
 * Shared store types / helpers used by JSON and Supabase backends.
 */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Input accepted when creating a record. */
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

/**
 * Input accepted when editing a record.
 * Keys that are absent or undefined leave the stored value alone.
 */
export type PatchInput<T> = Partial<CreateInput<T>> & { id: string };

/**
 * Drop keys whose value is undefined so patches do not wipe fields.
 */
export function definedOnly<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
