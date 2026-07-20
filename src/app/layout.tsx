import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { BackdropFilterProbe } from "@/components/BackdropFilterProbe";
import { isSupabaseConfigured } from "@/env";
import { getUser } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scaffylads.vercel.app"),
  title: "ScaffyLads — AI scaffolding logbook",
  description:
    "AI-native work schedule and project notebook for scaffolding crews. Logbooks, rosters, and site notes.",
  openGraph: {
    title: "ScaffyLads — AI work journal for scaffolding crews",
    description:
      "Logbooks, rosters, and WorkSafe-ready notes for Aotearoa scaffolding crews.",
    images: [{ url: "/social_preview.png", width: 1280, height: 720 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScaffyLads",
    description: "AI work journal for scaffolding crews",
    images: ["/social_preview.png"],
  },
};

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ">
      <body>
        <BackdropFilterProbe />
        <div className="app-shell">
          <Nav signedIn={await signedIn()} />
          <main className="app-main">{children}</main>
          <footer className="site-footer">
            <div className="site-footer-inner">
              <span>ScaffyLads · AI native work schedule + project notebook</span>
              <span className="site-footer-meta">
                Coastal Alpine Tech · cuzzycomputers · Taranaki / Aotearoa
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
