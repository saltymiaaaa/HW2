"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScoreRing from "@/components/score-ring";
import { useI18n } from "@/components/i18n";
import { VERDICT_SHORT, formatNumber, relativeTime, scheduleLabel } from "@/lib/format";
import type { ExitCost, Service } from "@/lib/types";

type Row = { service: Service; cost: ExitCost };
type Report = {
  headline: string;
  summary: {
    hours: number;
    usd: number;
    monthly: number;
    strandedItems: number;
    totalItems: number;
    failing: string[];
    unverified: string[];
    averageScore: number;
  };
  events: { at: string; text: string }[];
};

export default function Dashboard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setRows(d.services));
    fetch("/api/report")
      .then((r) => r.json())
      .then(setReport);
  }, []);

  const worstBand = report && report.summary.failing.length > 0 ? "trapped" : "sticky";

  return (
    <>
      <header className="page-head">
        <div className="row" style={{ marginBottom: 8 }}>
          <p className="eyebrow" style={{ margin: 0 }}>{t.nav.portfolio}</p>
          <span className="demo-flag">{t.portfolio.flag}</span>
        </div>
        <h1>{t.portfolio.h1}</h1>
        <p className="lede">{t.portfolio.lede}</p>
      </header>

      <div className="intro">
        <div>
          <strong>{t.portfolio.intro}</strong>
          {t.portfolio.introBody}
        </div>
      </div>

      {report ? (
        <section className="card" style={{ marginBottom: 22 }}>
          <p className={`verdict-sentence is-${worstBand}`}>{report.headline}</p>
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            <div className="stat">
              <span className="stat-value">{formatNumber(report.summary.hours)} h</span>
              <span className="stat-label">{t.portfolio.st1}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatNumber(report.summary.strandedItems)}</span>
              <span className="stat-label">
                {t.portfolio.st2} / {formatNumber(report.summary.totalItems)}
              </span>
            </div>
            <div className="stat">
              <span className="stat-value">${report.summary.monthly.toFixed(2)}</span>
              <span className="stat-label">{t.portfolio.st3}</span>
            </div>
          </div>
          {report.summary.unverified.length > 0 ? (
            <p className="note" style={{ marginTop: 16, marginBottom: 0 }}>
              {t.portfolio.unverified}: {report.summary.unverified.join(", ")}.
              {t.portfolio.unverifiedBody}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="card" style={{ marginBottom: 22 }}>
          <p className="muted" style={{ margin: 0 }}>{t.portfolio.loading}</p>
        </section>
      )}

      <div className="spread" style={{ marginBottom: 12 }}>
        <h2>{t.portfolio.services}</h2>
        <Link className="button" href="/report">
          {t.portfolio.openReport}
        </Link>
      </div>

      <div className="grid grid-2">
        {(rows ?? []).map(({ service, cost }) => {
          const last = service.snapshots[0];
          return (
            <Link key={service.id} href={`/services/${service.id}`} className="card service-card">
              <div className="spread">
                <div style={{ minWidth: 0 }}>
                  <div className="service-head">
                    <span className="avatar">{service.name.slice(0, 1)}</span>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0 }}>{service.name}</h3>
                      <p className="small muted" style={{ margin: 0 }}>
                        {service.category} · {service.plan}
                      </p>
                    </div>
                  </div>
                  <p className="small" style={{ color: "var(--ink-soft)", margin: "8px 0 0" }}>
                    {service.holds}
                  </p>
                </div>
                <ScoreRing score={cost.score} band={cost.band} size={72} />
              </div>

              <div className="row card-tail" style={{ marginTop: 14 }}>
                <span className={`badge ${cost.band}`}>{t.bands[cost.band]}</span>
                <span className={`badge ${last ? (last.verdict === "readable" ? "portable" : "sticky") : "neutral"}`}>
                  {last ? VERDICT_SHORT[last.verdict] : t.portfolio.unchecked}
                </span>
                <span className="small muted">
                  {last ? `${t.portfolio.checked} ${relativeTime(last.finishedAt)}` : t.portfolio.never} ·{" "}
                  {scheduleLabel(service.schedule)}
                </span>
              </div>

              <div className={`meter ${cost.band === "portable" ? "" : cost.band}`} style={{ marginTop: 12 }}>
                <span style={{ width: `${cost.score}%` }} />
              </div>

              <p className="small" style={{ margin: "12px 0 0", color: "var(--ink-soft)" }}>
                {cost.sentence}
              </p>
            </Link>
          );
        })}
      </div>

      {report && report.events.length > 0 ? (
        <section style={{ marginTop: 34 }}>
          <h2 style={{ marginBottom: 12 }}>{t.portfolio.recent}</h2>
          <div className="card">
            {report.events.slice(0, 8).map((e, i) => (
              <div className="finding" key={i}>
                <span className="dot ok" />
                <div>
                  <div>{e.text}</div>
                  <div className="small muted">{relativeTime(e.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
