import { z } from "zod";

/**
 * Supabase is optional on purpose.
 *
 * With it configured the app stores data in Postgres behind auth and RLS.
 * Without it, the local JSON store is used - which is how tests, CI and a
 * bare `npm run dev` work with no setup at all. See src/lib/store.ts.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  XAI_API_KEY: z.string().min(1).optional(),
  XAI_MODEL: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

function parseEnv(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Invalid environment configuration:\n${parsed.error.issues
          .map((i) => `  ${i.path.join(".")}: ${i.message}`)
          .join("\n")}`,
      );
    }
    cached = parsed.data;
  }
  return cached;
}

/**
 * Lazy proxy: defers reading process.env until a property is actually used.
 * `next build` imports every module to collect route data, so validating
 * eagerly at module scope would fail the build in any environment that does
 * not have the vars set - CI, for instance - even though they are present at
 * runtime.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return parseEnv()[prop as keyof Env];
  },
});

/** True when both Supabase values are present, so the cloud store can be used. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Narrowed accessor for code paths that have already checked the above. */
export function requireSupabaseConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, or unset both to use the local JSON store.",
    );
  }
  return { url, anonKey };
}
