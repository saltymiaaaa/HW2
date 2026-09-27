"use client";

import { useEffect, useState } from "react";
import ScoreRing from "@/components/score-ring";
import { useI18n } from "@/components/i18n";
import { loadReport, type ReportPayload } from "@/lib/client-data";
import { VERDICT_SHORT, formatDate, formatNumber } from "@/lib/format";

export default function ReportPage() {
  const { t } = useI18n();
  const [report, setReport] = useState<ReportPayload | null>(null);

  useEffect(() => {
    loadReport().then(setReport);
  }, []);

  if (!report) return <p className="muted">{t.report.loading}</p>;

  const { summary } = report;

  return (
    <>
      <div className="spread" style={{ marginBottom: 6 }}>
        <p className="eyebrow">{t.nav.report} · {formatDate(report.generatedAt)}</p>
        <button className="no-print" onClick={() => window.print()}>
          {t.report.print}
        </button>
      </div>

      <header className="page-head">
        <h1>{t.report.h1}</h1>
        <p className="lede">{t.report.lede}</p>
      </header>

      <div className="intro no-print">
        <div>
          <strong>{t.report.introStrong}</strong>
          {t.report.introBody}
        </div>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <p className="verdict-sentence is-sticky">{report.headline}</p>

        <div className="grid grid-3" style={{ marginTop: 22 }}>
          <div className="stat">
            <span className="stat-value">{formatNumber(summary.hours)} h</span>
            <span className="stat-label">{t.report.st1}</span>
          </div>
          <div className="stat">
            <span className="stat-value">${formatNumber(summary.usd)}</span>
            <span className="stat-label">{t.report.st2}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{summary.averageScore}</span>
            <span className="stat-label">{t.report.st3} {summary.count} {t.report.st3b}</span>
          </div>
        </div>

        {summary.worst ? (
          <p className="note" style={{ marginTop: 18, marginBottom: 0 }}>
            <strong>{summary.worst.name}</strong> {t.report.worstFirst} {summary.worst.sentence}
          </p>
        ) : null}
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 12 }}>{t.report.every}</h2>
        <table>
          <thead>
            <tr>
              <th>{t.report.th.service}</th>
              <th className="num">{t.report.th.exit}</th>
              <th>{t.report.th.band}</th>
              <th className="num">{t.report.th.hours}</th>
              <th>{t.report.th.last}</th>
              <th>{t.report.th.behind}</th>
            </tr>
          </thead>
          <tbody>
            {report.services.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                  <div className="small muted">{s.category}</div>
                </td>
                <td className="num">{s.score}</td>
                <td>
                  <span className={`badge ${s.band}`}>{t.bands[s.band]}</span>
                </td>
                <td className="num">{s.hours}</td>
                <td className="small">
                  {s.lastChecked ? formatDate(s.lastChecked) : t.report.never}
                  <div className="muted">{VERDICT_SHORT[s.verdict]}</div>
                </td>
                <td className="small muted">
                  {s.lostTypes.length === 0 ? t.report.nothing : s.lostTypes.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 style={{ marginBottom: 12 }}>{t.report.sentenceH2}</h2>
      <div className="stack">
        {report.services.map((s) => (
          <section className="card" key={s.id}>
            <div className="spread">
              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: 8 }}>{s.name}</h3>
                <p className={`verdict-sentence ${s.band === "portable" ? "" : `is-${s.band}`}`} style={{ marginBottom: 10 }}>
                  {s.sentence}
                </p>
                {s.bandReason ? (
                  <p className="note" style={{ marginBottom: 14 }}>{s.bandReason}</p>
                ) : null}
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                  {s.factors.map((f) => (
                    <div key={f.key}>
                      <div className="small" style={{ fontWeight: 600 }}>{f.label}</div>
                      <div className={`meter ${f.value > 0.66 ? "trapped" : f.value > 0.33 ? "sticky" : ""}`} style={{ margin: "4px 0" }}>
                        <span style={{ width: `${Math.round(f.value * 100)}%` }} />
                      </div>
                      <div className="small muted">{f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
              <ScoreRing score={s.score} band={s.band} size={78} />
            </div>
          </section>
        ))}
      </div>

      <p className="small muted" style={{ marginTop: 24 }}>{t.report.footnote}</p>
    </>
  );
}
