"use client";

import { useI18n } from "@/components/i18n";

export default function HowItWorks() {
  const { t } = useI18n();

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{t.nav.how}</p>
        <h1>{t.how.h1}</h1>
        <p className="lede">{t.how.lede}</p>
      </header>

      <div className="stack">
        {t.how.steps.map((s, i) => (
          <section className="card" key={s.h} style={i === 2 ? { borderColor: "var(--exit)" } : undefined}>
            <h2>{s.h}</h2>
            <p className="small" style={{ color: "var(--ink-soft)" }}>{s.p}</p>
          </section>
        ))}

        <section className="card">
          <h2>{t.how.notTitle}</h2>
          <ul className="small" style={{ color: "var(--ink-soft)", paddingLeft: 18 }}>
            {t.how.nots.map((n) => (
              <li key={n.s}>
                <strong>{n.s}</strong>
                {n.p}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>{t.how.realTitle}</h2>
          <table>
            <thead>
              <tr>
                <th>{t.how.th.part}</th>
                <th>{t.how.th.state}</th>
                <th>{t.how.th.where}</th>
              </tr>
            </thead>
            <tbody>
              {t.how.rows.map((r, i) => (
                <tr key={r.part}>
                  <td>{r.part}</td>
                  <td>
                    <span className={`badge ${i < 3 ? "portable" : "sticky"}`}>{r.state}</span>
                  </td>
                  <td className="mono">{["lib/read-archive.ts, lib/inspect.ts", "lib/score.ts", "app/api/cron, vercel.json", "lib/simulate.ts", "lib/seed.ts", "lib/store.ts"][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
