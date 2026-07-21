import { isSupabaseConfigured } from "@/env";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing_code: "That sign-in link was incomplete. Request a new one.",
  link_expired: "That sign-in link has expired or was already used.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "";
  const error = params.error ? ERRORS[params.error] : null;

  // Without Supabase the app runs on the local JSON store with no accounts,
  // so a sign-in form here would be a dead end. Say so rather than showing a
  // box that cannot work.
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <div className="card space-y-2 p-6">
          <h1 className="text-xl font-bold">Sign-in is not enabled</h1>
          <p className="text-sm text-[var(--muted)]">
            This install stores data in a local file and has no accounts. Set
            <code> NEXT_PUBLIC_SUPABASE_URL </code> and
            <code> NEXT_PUBLIC_SUPABASE_ANON_KEY </code> to turn on hosted
            storage with sign-in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      {error && (
        <p className="mb-3 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      <LoginClient next={next} />
    </div>
  );
}
