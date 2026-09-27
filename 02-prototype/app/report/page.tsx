"use client";

import { useEffect, useState } from "react";
import ScoreRing from "@/components/score-ring";
import { VERDICT_SHORT, formatDate, formatNumber } from "@/lib/format";
import { bandLabel } from "@/lib/score";
import type { ExitCost, Factor, Verdict } from "@/lib/types";

type ReportService = {
  id: string;
  name: string;
  category: string;
  score: number;
  band: ExitCost["band"];
  sentence: string;
  hours: number;
  usd: number;
  lostTypes: string[];
  lastChecked: string | null;
  verdict: Verdict;
  bandReason?: string;
  factors: Factor[];
};

type Report = {
  generatedAt: string;
  headline: string;
  summary: {
    count: number;
    hours: number;
    usd: number;
    monthly: number;
    averageScore: number;
    totalItems: number;
    strandedItems: number;
    failing: string[];
    unverified: string[];
    worst: { name: string; score: number; sentence: string } | null;
  };
  services: ReportService[];
};

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then((r) => r.json())
      .then(setReport);
  }, []);

  if (!report) return <p className="muted">Building the report.</p>;

  const { summary } = report;

  return (
    <>
      <div className="spread" style={{ marginBottom: 6 }}>
        <p className="eyebrow">Exit report · {formatDate(report.generatedAt)}</p>
        <button className="no-print" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>

      <header className="page-head">
        <h1>If you had to leave everything tomorrow</h1>
        <p className="lede">
          One page, covering every platform being watched. It is written to be read on the day
          somebody changes a price, which is the only day anyone asks this question.
        </p>
      </header>

      <div className="intro no-print">
        <div>
          <strong>What you are looking at.</strong> Every platform being watched, worst first, on
          one page. This is the view meant to be printed or saved as a PDF and sent to somebody on
          the day a price changes. Use the button above.
        </div>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <p className="verdict-sentence is-sticky">{report.headline}</p>

        <div className="grid grid-3" style={{ marginTop: 22 }}>
          <div className="stat">
            <span className="stat-value">{formatNumber(summary.hours)} h</span>
            <span className="stat-label">of work to be running elsewhere</span>
          </div>
          <div className="stat">
            <span className="stat-value">${formatNumber(summary.usd)}</span>
            <span className="stat-label">of direct spend to replace what you pay for</span>
          </div>
          <div className="stat">
            <span className="stat-value">{summary.averageScore}</span>
            <span className="stat-label">average exit cost across {summary.count} services</span>
          </div>
        </div>

        {summary.worst ? (
          <p className="note" style={{ marginTop: 18, marginBottom: 0 }}>
            <strong>{summary.worst.name}</strong> is the one to fix first. {summary.worst.sentence}
          </p>
        ) : null}
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 12 }}>Every service, worst first</h2>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th className="num">Exit cost</th>
              <th>Band</th>
              <th className="num">Hours</th>
              <th>Last copy</th>
              <th>Left behind</th>
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
                  <span className={`badge ${s.band}`}>{bandLabel(s.band)}</span>
                </td>
                <td className="num">{s.hours}</td>
                <td className="small">
                  {s.lastChecked ? formatDate(s.lastChecked) : "never"}
                  <div className="muted">{VERDICT_SHORT[s.verdict]}</div>
                </td>
                <td className="small muted">
                  {s.lostTypes.length === 0 ? "nothing" : s.lostTypes.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 style={{ marginBottom: 12 }}>The sentence for each one</h2>
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

      <p className="small muted" style={{ marginTop: 24 }}>
        Exit cost is six weighted factors read from the service record: what the export leaves
        behind, whether another tool can open it, the work required to obtain it, the cost of being
        running elsewhere, how fast the price moves, and what happens after you stop paying. No
        model produces this number, so it can be checked line by line.
      </p>
    </>
  );
}
