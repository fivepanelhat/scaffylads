import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "@/env";

/**
 * Browser Supabase client.
 *
 * Uses the anon key, which is designed to be public - every query it makes is
 * constrained by the RLS policies in supabase/migrations. Safe in Client
 * Components.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
