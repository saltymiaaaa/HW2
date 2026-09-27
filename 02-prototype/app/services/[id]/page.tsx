"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import RunStream from "@/components/run-stream";
import ScoreRing from "@/components/score-ring";
import Sparkline from "@/components/sparkline";
import { VERDICT_LABEL, formatBytes, formatDate, formatNumber, relativeTime } from "@/lib/format";
import { bandLabel, survives } from "@/lib/score";
import type { ExitCost, Schedule, Service } from "@/lib/types";

const COVERAGE_BADGE = {
  full: { className: "portable", label: "Comes out in full" },
  partial: { className: "sticky", label: "Comes out reduced" },
  none: { className: "trapped", label: "Stays behind" },
} as const;

export default function ServicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<{ service: Service; cost: ExitCost } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`/api/services/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No such service."))))
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

  async function changeSchedule(schedule: Schedule) {
    await fetch(`/api/services/${id}/schedule`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    load();
  }

  if (error) {
    return (
      <>
        <h1>{error}</h1>
        <p>
          <Link href="/portfolio">Back to the portfolio</Link>
        </p>
      </>
    );
  }

  if (!data) return <p className="muted">Loading.</p>;

  const { service, cost } = data;
  const last = service.snapshots[0];
  const totalItems = service.itemTypes.reduce((n, t) => n + t.count, 0);
  const strandedItems = service.itemTypes.reduce((n, t) => n + t.count * (1 - survives(t)), 0);

  return (
    <>
      <p className="eyebrow">
        <Link href="/portfolio" style={{ textDecoration: "none" }}>
          Portfolio
        </Link>{" "}
        / {service.category}
      </p>

      <div className="spread" style={{ alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{service.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {service.vendor} · {service.plan} · ${service.monthlyUsd.toFixed(2)} a month ·{" "}
            {service.yearsStored} years of your data
          </p>
        </div>
        <ScoreRing score={cost.score} band={cost.band} size={100} label={`${bandLabel(cost.band)}`} />
      </div>

      <div className="intro">
        <div>
          <strong>What you are looking at.</strong> One platform in full. The sentence below is the
          product&rsquo;s entire output. Under it, the six factors that produced the score, each
          shown with the evidence it was read from, and then every item type you hold with whether
          it survives the export. Press <strong>Check this service now</strong> to watch a run
          happen step by step.
        </div>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <p className={`verdict-sentence is-${cost.band}`} style={{ marginBottom: cost.bandReason ? 12 : 18 }}>
          {cost.sentence}
        </p>
        {cost.bandReason ? (
          <p className="note" style={{ marginBottom: 18 }}>
            Scored {cost.score}, and still counted as trapped. {cost.bandReason}
          </p>
        ) : null}
        <div className="row no-print">
          <button
            className="primary"
            disabled={running}
            onClick={() => {
              setRunning(true);
              setTimeout(() => streamRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
            }}
          >
            {running ? "Checking" : "Check this service now"}
          </button>
          <label className="row" style={{ gap: 8 }}>
            <span className="small muted">Check automatically</span>
            <select
              value={service.schedule}
              onChange={(e) => changeSchedule(e.target.value as Schedule)}
            >
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
              <option value="off">Never</option>
            </select>
          </label>
          <span className="small muted">
            {last ? `Last checked ${relativeTime(last.finishedAt)}` : "Never checked"}
          </span>
        </div>
      </section>

      <div ref={streamRef}>
        {running ? (
          <RunStream
            serviceId={service.id}
            onDone={() => {
              setRunning(false);
              load();
            }}
          />
        ) : null}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <section className="card">
          <h2 style={{ marginBottom: 4 }}>Why the score is what it is</h2>
          <p className="small muted" style={{ marginBottom: 14 }}>
            Six weighted factors, each one read from a field you can check. No model is involved,
            which is why the number can be argued with.
          </p>
          {cost.factors.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div className="spread" style={{ alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: "0.93rem" }}>{f.label}</span>
                <span className="mono muted">
                  {Math.round(f.value * 100)} · weight {Math.round(f.weight * 100)}%
                </span>
              </div>
              <div className={`meter ${f.value > 0.66 ? "trapped" : f.value > 0.33 ? "sticky" : ""}`}>
                <span style={{ width: `${Math.round(f.value * 100)}%` }} />
              </div>
              <p className="small muted" style={{ margin: "5px 0 0" }}>
                {f.evidence}
              </p>
            </div>
          ))}
        </section>

        <section className="stack">
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>What you keep here</h3>
            <p className="small" style={{ color: "var(--ink-soft)" }}>{service.holds}</p>
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>Items held</dt>
              <dd>{formatNumber(totalItems)}</dd>
              <dt>Would not follow</dt>
              <dd>{formatNumber(strandedItems)}</dd>
              <dt>Export</dt>
              <dd>{service.exportFormats.join(", ")}</dd>
              <dt>Copy written to</dt>
              <dd className="mono">{service.destination}</dd>
              <dt>After cancellation</dt>
              <dd>{service.deletion.note}</dd>
            </dl>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 6 }}>What this has cost over time</h3>
            <p className="small muted" style={{ marginBottom: 10 }}>
              A price that moves is the most common reason people find out too late that leaving is
              expensive.
            </p>
            <Sparkline points={service.priceHistory} />
          </div>
        </section>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Item by item</h2>
        <p className="small muted" style={{ marginBottom: 14 }}>
          The platform is asked how much of each thing you hold. The copy is asked the same
          question. This table is the difference.
        </p>
        <table>
          <thead>
            <tr>
              <th>Item type</th>
              <th className="num">You hold</th>
              <th>In the copy</th>
              <th>What happens</th>
            </tr>
          </thead>
          <tbody>
            {service.itemTypes.map((t) => (
              <tr key={t.key}>
                <td style={{ fontWeight: 600 }}>{t.label}</td>
                <td className="num">{formatNumber(t.count)}</td>
                <td>
                  <span className={`badge ${COVERAGE_BADGE[t.coverage].className}`}>
                    {COVERAGE_BADGE[t.coverage].label}
                  </span>
                </td>
                <td className="muted">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 style={{ marginBottom: 14 }}>Every copy taken so far</h2>
        {service.snapshots.length === 0 ? (
          <p className="muted">No copy has been taken yet. Run a check to create the first one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Taken</th>
                <th>Verdict</th>
                <th className="num">Size</th>
                <th className="num">Files</th>
                <th className="num">Exit cost</th>
                <th>What was observed</th>
              </tr>
            </thead>
            <tbody>
              {service.snapshots.map((s) => (
                <tr key={s.id}>
                  <td>{formatDate(s.finishedAt)}</td>
                  <td>
                    <span
                      className={`badge ${s.verdict === "readable" ? "portable" : s.verdict === "lossy" ? "sticky" : "trapped"}`}
                    >
                      {VERDICT_LABEL[s.verdict]}
                    </span>
                  </td>
                  <td className="num">{formatBytes(s.sizeBytes)}</td>
                  <td className="num">{formatNumber(s.fileCount)}</td>
                  <td className="num">{s.exitCost}</td>
                  <td className="muted small">{s.notes[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
