"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import { useI18n, LanguageSwitcher } from "./i18n";

export default function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/", label: t.nav.overview, note: t.nav.notes.overview },
    { href: "/portfolio", label: t.nav.portfolio, note: t.nav.notes.portfolio },
    { href: "/verify", label: t.nav.verify, note: t.nav.notes.verify },
    { href: "/report", label: t.nav.report, note: t.nav.notes.report },
    { href: "/how-it-works", label: t.nav.how, note: t.nav.notes.how },
  ];

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Logo />
        <span>
          <span className="brand-name">Exit Check</span>
          <br />
          <span className="brand-sub">{t.nav.tagline}</span>
        </span>
      </Link>

      <nav className="nav">
        {links.map((link) => {
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
        <LanguageSwitcher />
        <p style={{ margin: "10px 0 0" }}>
          <Link href="/#how-to-use" style={{ color: "var(--exit)" }}>
            {t.nav.startLink}
          </Link>
        </p>
      </div>
    </aside>
  );
}
