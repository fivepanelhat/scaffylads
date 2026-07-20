"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/schedule", label: "Schedule" },
  { href: "/logbook", label: "Logbook" },
  { href: "/ask", label: "Ask Scaffy" },
  { href: "/mission", label: "Mission" },
  { href: "/architecture", label: "Architecture" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand">
          <span aria-hidden className="brand-mark">
            SL
          </span>
          <span className="brand-text">
            <span className="brand-name">ScaffyLads</span>
            <span className="brand-tag">Scaffold Journal</span>
          </span>
        </Link>
        <nav className="site-nav-links" aria-label="Primary">
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
                aria-current={active ? "page" : undefined}
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
