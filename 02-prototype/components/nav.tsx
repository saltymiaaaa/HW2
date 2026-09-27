"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

const LINKS = [
  { href: "/", label: "Overview", note: "start here" },
  { href: "/portfolio", label: "Portfolio", note: "demo data" },
  { href: "/verify", label: "Check an export", note: "real" },
  { href: "/report", label: "Exit report", note: "printable" },
  { href: "/how-it-works", label: "How it works", note: "" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Logo />
        <span>
          <span className="brand-name">Exit Check</span>
          <br />
          <span className="brand-sub">Know the cost of leaving</span>
        </span>
      </Link>

      <nav className="nav">
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
              <span>{link.label}</span>
              {link.note ? (
                <span className="small muted" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>
                  {link.note}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <p style={{ margin: 0 }}>
          Prototype. The portfolio is demo data. The export checker is real: it reads the archive
          in your browser and nothing is uploaded.
        </p>
        <p style={{ margin: "8px 0 0" }}>
          <Link href="/#how-to-use" style={{ color: "var(--exit)" }}>
            New here? Start with the three steps.
          </Link>
        </p>
      </div>
    </aside>
  );
}
