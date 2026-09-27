"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/components/i18n";
import { buildSampleExport } from "@/lib/sample-export";
import { readArchive } from "@/lib/read-archive";
import { verifyManifest } from "@/lib/client-data";
import { formatBytes, formatNumber } from "@/lib/format";
import type { Inspection, Manifest } from "@/lib/types";

const VERDICT_STYLE = {
  readable: "portable",
  lossy: "sticky",
  unreadable: "trapped",
  unknown: "neutral",
} as const;

export default function VerifyPage() {
  const { t } = useI18n();
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ fraction: 0, label: "" });
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setInspection(null);
    setBusy(true);
    setProgress({ fraction: 0.02, label: "" });

    try {
      const read = await readArchive(file, (fraction, label) => setProgress({ fraction, label }));
      setManifest(read);
      setProgress({ fraction: 1, label: "" });

      const inspection = await verifyManifest(read);
      setInspection(inspection);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  async function trySample() {
    const blob = buildSampleExport();
    const file = new File([blob], "sample-export.zip", { type: "application/zip" });
    await handleFile(file);
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{t.nav.verify}</p>
        <h1>{t.verify.h1}</h1>
        <p className="lede">{t.verify.lede}</p>
      </header>

      <div className="intro">
        <div>
          <strong>{t.verify.introStrong}</strong>
          {t.verify.introBody}
        </div>
      </div>

      <div
        className={`dropzone ${over ? "over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <p style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", marginBottom: 6 }}>
          {busy ? (progress.label || t.verify.opening) : t.verify.drop}
        </p>
        <p className="small muted">{t.verify.dropHint}</p>

        {busy ? (
          <div className="meter" style={{ maxWidth: 320, margin: "16px auto 0" }}>
            <span style={{ width: `${Math.round(progress.fraction * 100)}%` }} />
          </div>
        ) : (
          <div className="row no-print" style={{ justifyContent: "center", marginTop: 16 }}>
            <button className="primary" onClick={() => inputRef.current?.click()}>
              {t.verify.choose}
            </button>
            <button onClick={trySample}>{t.verify.trySample}</button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error ? (
        <p className="note" style={{ marginTop: 18 }}>
          {error}
        </p>
      ) : null}

      {inspection && manifest ? (
        <>
          <section className="card" style={{ marginTop: 22 }}>
            <div className="spread" style={{ marginBottom: 12 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>
                  {inspection.shape}
                </p>
                <h2>{t.verify.verdictTitles[inspection.verdict]}</h2>
              </div>
              <span className={`badge ${VERDICT_STYLE[inspection.verdict]}`}>
                {t.verdicts[inspection.verdict]}
              </span>
            </div>

            <p
              className={`verdict-sentence ${inspection.verdict === "readable" ? "" : inspection.verdict === "lossy" ? "is-sticky" : "is-trapped"}`}
            >
              {inspection.sentence}
            </p>

            <div className="grid grid-3" style={{ marginTop: 20 }}>
              <div className="stat">
                <span className="stat-value">{formatNumber(inspection.fileCount)}</span>
                <span className="stat-label">{t.verify.filesRead} {manifest.sourceName}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatBytes(inspection.totalBytes)}</span>
                <span className="stat-label">{t.verify.uncompressed}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round(inspection.openFormatRatio * 100)}%</span>
                <span className="stat-label">{t.verify.openFmt}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <section className="card">
              <h2 style={{ marginBottom: 12 }}>{t.verify.costTime}</h2>
              {inspection.findings.length === 0 ? (
                <p className="muted">{t.verify.nothing}</p>
              ) : (
                inspection.findings.map((f, i) => (
                  <div className="finding" key={i}>
                    <span className={`dot ${f.level}`} />
                    <div>
                      <div className="finding-title">{f.title}</div>
                      <div className="finding-detail small">{f.detail}</div>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="card">
              <h2 style={{ marginBottom: 12 }}>{t.verify.contents}</h2>
              <table>
                <thead>
                  <tr>
                    <th>{t.verify.th.format}</th>
                    <th className="num">{t.verify.th.files}</th>
                    <th className="num">{t.verify.th.size}</th>
                    <th>{t.verify.th.opens}</th>
                  </tr>
                </thead>
                <tbody>
                  {inspection.byExtension.map((x) => (
                    <tr key={x.ext}>
                      <td className="mono">.{x.ext}</td>
                      <td className="num">{formatNumber(x.count)}</td>
                      <td className="num">{formatBytes(x.bytes)}</td>
                      <td>
                        <span className={`badge ${x.open ? "portable" : "trapped"}`}>
                          {x.open ? t.verify.th.yes : t.verify.th.no}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </>
      ) : null}

      <section className="card" style={{ marginTop: 22 }}>
        <h3 style={{ marginBottom: 8 }}>{t.verify.checking}</h3>
        <ul className="small" style={{ color: "var(--ink-soft)", paddingLeft: 18, margin: 0 }}>
          {t.verify.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
