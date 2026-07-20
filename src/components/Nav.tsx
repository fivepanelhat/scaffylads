"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/schedule", label: "Schedule" },
  { href: "/logbook", label: "Logbook" },
  { href: "/architecture", label: "Architecture" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#0b1220]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#ffcf70] text-[#1a1200]"
          >
            SL
          </span>
          <span>
            ScaffyLads
            <span className="ml-2 text-xs font-semibold text-[var(--muted)]">
              Scaffold Journal
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
