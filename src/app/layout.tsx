import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { BackdropFilterProbe } from "@/components/BackdropFilterProbe";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaffyLads — AI scaffolding logbook",
  description:
    "AI-native work schedule and project notebook for scaffolding crews. Logbooks, rosters, and site notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ">
      <body>
        <BackdropFilterProbe />
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-sm text-[var(--muted)]">
          ScaffyLads · AI native work schedule + project notebook · cuzzycomputers
        </footer>
      </body>
    </html>
  );
}
