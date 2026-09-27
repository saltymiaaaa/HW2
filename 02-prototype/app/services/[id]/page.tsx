"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import RunStream from "@/components/run-stream";
import ScoreRing from "@/components/score-ring";
import Sparkline from "@/components/sparkline";
import { useI18n } from "@/components/i18n";
import { VERDICT_LABEL, formatBytes, formatDate, formatNumber, relativeTime } from "@/lib/format";
import { survives } from "@/lib/score";
import type { ExitCost, Schedule, Service } from "@/lib/types";

const COVERAGE_BADGE = {
  full: "portable",
  partial: "sticky",
  none: "trapped",
} as const;

export default function ServicePage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<{ service: Service; cost: ExitCost } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`/api/services/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(t.service.notFound))))
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [id, t]);

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
          <Link href="/portfolio">{t.service.back}</Link>
        </p>
      </>
    );
  }

  if (!data) return <p className="muted">{t.service.loading}</p>;

  const { service, cost } = data;
  const last = service.snapshots[0];
  const totalItems = service.itemTypes.reduce((n, t2) => n + t2.count, 0);
  const strandedItems = service.itemTypes.reduce((n, t2) => n + t2.count * (1 - survives(t2)), 0);

  return (
    <>
      <p className="eyebrow">
        <Link href="/portfolio" style={{ textDecoration: "none" }}>
          {t.nav.portfolio}
        </Link>{" "}
        / {service.category}
      </p>

      <div className="spread" style={{ alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{service.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {service.vendor} · {service.plan} · ${service.monthlyUsd.toFixed(2)}/mo ·{" "}
            {service.yearsStored} yrs
          </p>
        </div>
        <ScoreRing score={cost.score} band={cost.band} size={100} label={t.bands[cost.band]} />
      </div>

      <div className="intro">
        <div>
          <strong>{t.service.introStrong}</strong>
          {t.service.introBody}
        </div>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <p className={`verdict-sentence is-${cost.band}`} style={{ marginBottom: cost.bandReason ? 12 : 18 }}>
          {cost.sentence}
        </p>
        {cost.bandReason ? (
          <p className="note" style={{ marginBottom: 18 }}>
            {t.service.bandReasonA} {cost.score}
            {t.service.bandReasonB} {cost.bandReason}
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
            {running ? t.service.checking : t.service.checkNow}
          </button>
          <label className="row" style={{ gap: 8 }}>
            <span className="small muted">{t.service.auto}</span>
            <select
              value={service.schedule}
              onChange={(e) => changeSchedule(e.target.value as Schedule)}
            >
              <option value="daily">{t.service.schedule.daily}</option>
              <option value="weekly">{t.service.schedule.weekly}</option>
              <option value="monthly">{t.service.schedule.monthly}</option>
              <option value="off">{t.service.schedule.off}</option>
            </select>
          </label>
          <span className="small muted">
            {last ? `${t.service.lastChecked} ${relativeTime(last.finishedAt)}` : t.service.never}
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
          <h2 style={{ marginBottom: 4 }}>{t.service.why}</h2>
          <p className="small muted" style={{ marginBottom: 14 }}>
            {t.service.whySub}
          </p>
          {cost.factors.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div className="spread" style={{ alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: "0.93rem" }}>{f.label}</span>
                <span className="mono muted">
                  {Math.round(f.value * 100)} · {t.service.weight} {Math.round(f.weight * 100)}%
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
            <h3 style={{ marginBottom: 10 }}>{t.service.keep}</h3>
            <p className="small" style={{ color: "var(--ink-soft)" }}>{service.holds}</p>
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>{t.service.kv.items}</dt>
              <dd>{formatNumber(totalItems)}</dd>
              <dt>{t.service.kv.stranded}</dt>
              <dd>{formatNumber(strandedItems)}</dd>
              <dt>{t.service.kv.export}</dt>
              <dd>{service.exportFormats.join(", ")}</dd>
              <dt>{t.service.kv.copy}</dt>
              <dd className="mono">{service.destination}</dd>
              <dt>{t.service.kv.after}</dt>
              <dd>{service.deletion.note}</dd>
            </dl>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 6 }}>{t.service.costOverTime}</h3>
            <p className="small muted" style={{ marginBottom: 10 }}>
              {t.service.costSub}
            </p>
            <Sparkline points={service.priceHistory} />
          </div>
        </section>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>{t.service.itemByItem}</h2>
        <p className="small muted" style={{ marginBottom: 14 }}>
          {t.service.itemSub}
        </p>
        <table>
          <thead>
            <tr>
              <th>{t.service.th.type}</th>
              <th className="num">{t.service.th.hold}</th>
              <th>{t.service.th.copy}</th>
              <th>{t.service.th.what}</th>
            </tr>
          </thead>
          <tbody>
            {service.itemTypes.map((it) => (
              <tr key={it.key}>
                <td style={{ fontWeight: 600 }}>{it.label}</td>
                <td className="num">{formatNumber(it.count)}</td>
                <td>
                  <span className={`badge ${COVERAGE_BADGE[it.coverage]}`}>
                    {t.service.coverage[it.coverage]}
                  </span>
                </td>
                <td className="muted">{it.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 style={{ marginBottom: 14 }}>{t.service.copies}</h2>
        {service.snapshots.length === 0 ? (
          <p className="muted">{t.service.copiesEmpty}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t.service.th2.taken}</th>
                <th>{t.service.th2.verdict}</th>
                <th className="num">{t.service.th2.size}</th>
                <th className="num">{t.service.th2.files}</th>
                <th className="num">{t.service.th2.exit}</th>
                <th>{t.service.th2.seen}</th>
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
