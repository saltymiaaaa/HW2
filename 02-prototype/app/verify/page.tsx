"use client";

import { useCallback, useRef, useState } from "react";
import { buildSampleExport } from "@/lib/sample-export";
import { readArchive } from "@/lib/read-archive";
import { formatBytes, formatNumber } from "@/lib/format";
import type { Inspection, Manifest } from "@/lib/types";

const VERDICT_STYLE = {
  readable: { badge: "portable", title: "This is a real backup" },
  lossy: { badge: "sticky", title: "This opens, and it is not a complete exit" },
  unreadable: { badge: "trapped", title: "This does not reliably open" },
  unknown: { badge: "neutral", title: "Nothing to judge yet" },
} as const;

export default function VerifyPage() {
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
    setProgress({ fraction: 0.02, label: "Opening the file" });

    try {
      const read = await readArchive(file, (fraction, label) => setProgress({ fraction, label }));
      setManifest(read);
      setProgress({ fraction: 1, label: "Scoring the manifest" });

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(read),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The check failed.");
      setInspection(data.inspection as Inspection);
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
        <p className="eyebrow">Check an export</p>
        <h1>A download is not a backup until something opens it</h1>
        <p className="lede">
          Drop a real export here. Exit Check reads the archive inside your browser, parses what it
          can, and reports what would still hurt on the day you leave. The file is not uploaded, and
          only the list of names, sizes and parse results reaches the server.
        </p>
      </header>

      <div className="intro">
        <div>
          <strong>This page is not a demo.</strong> It runs real parsers over a real file. If you do
          not have an export to hand, press <strong>Try it with a sample export</strong> below: it
          builds a deliberately flawed archive in your browser, containing faults taken from genuine
          exports, and then checks it exactly as it would check yours.
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
          {busy ? progress.label : "Drop an export archive here"}
        </p>
        <p className="small muted">
          A .zip from Google Takeout, Slack, Notion, X or anywhere else. Also .enex, .json, .csv,
          .xml and single files.
        </p>

        {busy ? (
          <div className="meter" style={{ maxWidth: 320, margin: "16px auto 0" }}>
            <span style={{ width: `${Math.round(progress.fraction * 100)}%` }} />
          </div>
        ) : (
          <div className="row no-print" style={{ justifyContent: "center", marginTop: 16 }}>
            <button className="primary" onClick={() => inputRef.current?.click()}>
              Choose a file
            </button>
            <button onClick={trySample}>Try it with a sample export</button>
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
                <h2>{VERDICT_STYLE[inspection.verdict].title}</h2>
              </div>
              <span className={`badge ${VERDICT_STYLE[inspection.verdict].badge}`}>
                {inspection.verdict}
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
                <span className="stat-label">files read from {manifest.sourceName}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatBytes(inspection.totalBytes)}</span>
                <span className="stat-label">uncompressed inside the archive</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round(inspection.openFormatRatio * 100)}%</span>
                <span className="stat-label">in a format another program opens</span>
              </div>
            </div>
          </section>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <section className="card">
              <h2 style={{ marginBottom: 12 }}>What would cost you time</h2>
              {inspection.findings.length === 0 ? (
                <p className="muted">Nothing worth reporting, which is rarer than it should be.</p>
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
              <h2 style={{ marginBottom: 12 }}>What is in there</h2>
              <table>
                <thead>
                  <tr>
                    <th>Format</th>
                    <th className="num">Files</th>
                    <th className="num">Size</th>
                    <th>Opens elsewhere</th>
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
                          {x.open ? "Yes" : "No"}
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
        <h3 style={{ marginBottom: 8 }}>What is actually being checked</h3>
        <ul className="small" style={{ color: "var(--ink-soft)", paddingLeft: 18, margin: 0 }}>
          <li>Every JSON, NDJSON, CSV, XML and ENEX file is parsed, not counted.</li>
          <li>Images are checked against their magic bytes, so a .jpg that is not a JPEG is caught.</li>
          <li>Zero byte files are reported, because they pass a file count and hold nothing.</li>
          <li>Paths that will not restore on Windows are listed before you need them.</li>
          <li>Archives inside the archive are named, since no total above includes them.</li>
          <li>Metadata sidecars are flagged, because most importers quietly ignore them.</li>
        </ul>
      </section>
    </>
  );
}
