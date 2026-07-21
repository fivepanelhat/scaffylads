"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginClient({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const redirect = new URL("/auth/callback", window.location.origin);
      if (next) redirect.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect.toString() },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send the sign-in link",
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card space-y-2 p-6">
        <h1 className="text-xl font-bold">Check your email</h1>
        <p className="text-sm text-[var(--muted)]">
          We sent a sign-in link to <strong>{email}</strong>. Open it on this
          device and you will be signed straight in. The link works once and
          expires after an hour.
        </p>
        <button className="btn mt-2" type="button" onClick={() => setSent(false)}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="card space-y-3 p-6">
      <h1 className="text-xl font-bold">Sign in to ScaffyLads</h1>
      <p className="text-sm text-[var(--muted)]">
        Enter your email and we will send a one-time sign-in link. No password
        to remember or lose on site.
      </p>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.co.nz"
        />
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <button className="btn btn-primary" type="submit" disabled={busy || !email}>
        {busy ? "Sending…" : "Email me a sign-in link"}
      </button>

      <p className="text-xs text-[var(--muted)]">
        Your logbook is private to your account. Nobody else signing in can see
        your projects, shifts or entries.
      </p>
    </form>
  );
}

export default LoginClient;
