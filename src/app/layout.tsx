import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { isSupabaseConfigured } from "@/env";
import { getUser } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaffyLads — AI scaffolding logbook",
  description:
    "AI-native work schedule and project notebook for scaffolding crews. Logbooks, rosters, and site notes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ">
      <body>
        <Nav signedIn={await signedIn()} />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-sm text-[var(--muted)]">
          ScaffyLads · AI native work schedule + project notebook · cuzzycomputers
        </footer>
      </body>
    </html>
  );
}

/**
 * Only ask Supabase who the user is when Supabase is actually configured -
 * on the local JSON store there are no accounts to check.
 */
async function signedIn(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    return Boolean(await getUser());
  } catch {
    return false;
  }
}
