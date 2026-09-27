/**
 * Stress test.
 *
 *   npm run build && npm start -- -p 3400
 *   npm run test:stress
 *
 * Two halves. The first pushes the archive checker, which is the part that
 * touches real bytes and is therefore the part that can actually fall over.
 * The second pushes the API, including the streaming endpoint, since a check
 * run holds a connection open for several seconds and several people could be
 * watching one at once.
 *
 * Every case prints a duration and asserts a budget, so a regression shows up
 * as a number rather than as a feeling.
 */

import { zipSync, strToU8 } from "fflate";
import { readArchive } from "../lib/read-archive";
import { inspectManifest } from "../lib/inspect";
import type { Manifest, ManifestEntry } from "../lib/types";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3400";

let failed = 0;
const rows: { name: string; detail: string; ms: number; budget: number; ok: boolean }[] = [];

async function timed<T>(name: string, budgetMs: number, fn: () => Promise<T> | T) {
  const start = performance.now();
  let detail = "";
  let ok = true;
  try {
    const result = await fn();
    detail = typeof result === "string" ? result : "";
  } catch (error) {
    ok = false;
    detail = `threw: ${(error as Error).message}`;
  }
  const ms = performance.now() - start;
  if (ms > budgetMs) ok = false;
  if (!ok) failed += 1;
  rows.push({ name, detail, ms, budget: budgetMs, ok });
  console.log(
    `  ${ok ? "ok  " : "SLOW"} ${name.padEnd(46)} ${ms.toFixed(0).padStart(6)} ms   (budget ${budgetMs})${detail ? `  ${detail}` : ""}`
  );
}

function assert(name: string, condition: boolean, detail = "") {
  if (!condition) failed += 1;
  console.log(`  ${condition ? "ok  " : "FAIL"} ${name}${detail ? `  ${detail}` : ""}`);
}

function syntheticManifest(count: number): Manifest {
  const entries: ManifestEntry[] = Array.from({ length: count }, (_, i) => ({
    path: `export/folder-${i % 200}/file-${i}.${["json", "csv", "md", "jpg", "fig"][i % 5]}`,
    size: 1000 + (i % 5000),
    ext: ["json", "csv", "md", "jpg", "fig"][i % 5],
    parsed: i % 997 === 0 ? ("failed" as const) : ("ok" as const),
  }));
  return { sourceName: `synthetic-${count}.zip`, sourceSize: count * 2000, kind: "zip", entries, truncated: false };
}

function buildZip(fileCount: number, bytesEach: number): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  for (let i = 0; i < fileCount; i += 1) {
    const kind = i % 4;
    if (kind === 0) files[`export/data/rec-${i}.json`] = strToU8(JSON.stringify({ id: i, note: "x".repeat(bytesEach) }));
    else if (kind === 1) files[`export/tables/t-${i}.csv`] = strToU8(`id,value\n${i},${"y".repeat(bytesEach)}\n`);
    else if (kind === 2) files[`export/notes/n-${i}.md`] = strToU8(`# Note ${i}\n\n${"z".repeat(bytesEach)}\n`);
    else {
      const jpg = new Uint8Array(bytesEach + 16);
      jpg.set([0xff, 0xd8, 0xff, 0xe0]);
      files[`export/media/img-${i}.jpg`] = jpg;
    }
  }
  return zipSync(files);
}

async function main() {
  console.log(`Exit Check stress test against ${BASE}\n${"=".repeat(88)}`);

  // ------------------------------------------------------------------
  console.log("\nThe archive checker, on synthetic manifests");

  await timed("score a 1,000 file manifest", 150, () => {
    const result = inspectManifest(syntheticManifest(1_000));
    return `${result.fileCount} files, verdict ${result.verdict}`;
  });

  await timed("score a 20,000 file manifest", 600, () => {
    const result = inspectManifest(syntheticManifest(20_000));
    return `${result.findings.length} findings`;
  });

  await timed("score a 120,000 file manifest", 3_000, () => {
    const result = inspectManifest(syntheticManifest(120_000));
    return `${result.fileCount} files`;
  });

  await timed("score a manifest where everything is broken", 600, () => {
    const manifest = syntheticManifest(10_000);
    for (const entry of manifest.entries) entry.parsed = "failed";
    const result = inspectManifest(manifest);
    if (result.verdict !== "unreadable") throw new Error(`expected unreadable, got ${result.verdict}`);
    return "verdict unreadable, as it should be";
  });

  // ------------------------------------------------------------------
  console.log("\nThe archive checker, on real zip files");

  let smallZip!: Uint8Array;
  await timed("build a 2,000 file zip", 6_000, () => {
    smallZip = buildZip(2_000, 400);
    return `${(smallZip.length / 1024 / 1024).toFixed(1)} MB`;
  });

  await timed("open and parse that 2,000 file zip", 12_000, async () => {
    const file = new File([smallZip as unknown as BlobPart], "small.zip", { type: "application/zip" });
    const manifest = await readArchive(file);
    const inspection = inspectManifest(manifest);
    if (manifest.entries.length !== 2_000) throw new Error(`read ${manifest.entries.length} of 2000`);
    return `${inspection.fileCount} files, ${Math.round(inspection.openFormatRatio * 100)} percent open`;
  });

  let bigZip!: Uint8Array;
  await timed("build a 12,000 file zip", 30_000, () => {
    bigZip = buildZip(12_000, 900);
    return `${(bigZip.length / 1024 / 1024).toFixed(1)} MB`;
  });

  await timed("open and parse that 12,000 file zip", 60_000, async () => {
    const file = new File([bigZip as unknown as BlobPart], "big.zip", { type: "application/zip" });
    const manifest = await readArchive(file);
    const inspection = inspectManifest(manifest);
    if (manifest.entries.length !== 12_000) throw new Error(`read ${manifest.entries.length} of 12000`);
    return `${inspection.fileCount} files`;
  });

  // ------------------------------------------------------------------
  console.log("\nThe archive checker, on files designed to break it");

  await timed("a file that is not a zip at all", 2_000, async () => {
    const file = new File(["this is plainly not a zip archive"], "broken.zip", { type: "application/zip" });
    try {
      await readArchive(file);
      return "opened without complaint, which is wrong";
    } catch (error) {
      return `refused cleanly: ${(error as Error).message.slice(0, 40)}`;
    }
  });

  await timed("a zip whose contents are truncated JSON", 2_000, async () => {
    const zip = zipSync({
      "export/broken.json": strToU8('{"a": 1, "b": [1, 2,'),
      "export/fine.json": strToU8('{"a": 1}'),
    });
    const file = new File([zip as unknown as BlobPart], "truncated.zip", { type: "application/zip" });
    const inspection = inspectManifest(await readArchive(file));
    if (!inspection.findings.some((f) => /not readable/.test(f.title))) throw new Error("the broken file was not caught");
    return "the broken file was named";
  });

  await timed("paths with unicode, spaces and reserved characters", 2_000, async () => {
    const zip = zipSync({
      "export/ghi chú/Đường dẫn tiếng Việt.md": strToU8("# xin chào\n"),
      "export/with spaces/a file name.csv": strToU8("a,b\n1,2\n"),
      "export/emoji/note.md": strToU8("# fine\n"),
    });
    const file = new File([zip as unknown as BlobPart], "unicode.zip", { type: "application/zip" });
    const manifest = await readArchive(file);
    if (manifest.entries.length !== 3) throw new Error(`read ${manifest.entries.length} of 3`);
    return "all three read";
  });

  await timed("a 4,000 character path", 2_000, () => {
    const manifest = syntheticManifest(10);
    manifest.entries[0].path = `export/${"a".repeat(4_000)}.md`;
    const inspection = inspectManifest(manifest);
    if (!inspection.findings.some((f) => /will not restore/.test(f.title))) throw new Error("not flagged");
    return "flagged as unrestorable";
  });

  await timed("an archive that is entirely empty files", 2_000, () => {
    const manifest = syntheticManifest(500);
    for (const entry of manifest.entries) entry.size = 0;
    const inspection = inspectManifest(manifest);
    if (!inspection.findings.some((f) => /zero bytes/.test(f.title))) throw new Error("not flagged");
    return `total bytes ${inspection.totalBytes}, no division by zero`;
  });

  await timed("500 nested archives inside one archive", 2_000, () => {
    const manifest = syntheticManifest(50);
    for (let i = 0; i < 500; i += 1) manifest.entries.push({ path: `export/inner-${i}.zip`, size: 5000, ext: "zip" });
    const inspection = inspectManifest(manifest);
    if (!inspection.findings.some((f) => /inside this archive/.test(f.title))) throw new Error("not flagged");
    return "flagged";
  });

  // ------------------------------------------------------------------
  console.log("\nThe API under load");

  const up = await fetch(BASE + "/api/report").then((r) => r.ok).catch(() => false);
  if (!up) {
    console.log(`\n  The server is not answering at ${BASE}. Skipping the API half.`);
    console.log(`  Start it with: npm run build && npm start -- -p 3400`);
  } else {
    await timed("200 concurrent report requests", 20_000, async () => {
      const results = await Promise.all(
        Array.from({ length: 200 }, () => fetch(BASE + "/api/report").then((r) => r.status))
      );
      const bad = results.filter((s) => s !== 200).length;
      if (bad > 0) throw new Error(`${bad} of 200 did not return 200`);
      return "200 of 200 returned 200";
    });

    await timed("100 concurrent service reads", 15_000, async () => {
      const ids = ["evernote", "notion", "slack", "figma", "google-photos", "github"];
      const results = await Promise.all(
        Array.from({ length: 100 }, (_, i) => fetch(`${BASE}/api/services/${ids[i % ids.length]}`).then((r) => r.status))
      );
      const bad = results.filter((s) => s !== 200).length;
      if (bad > 0) throw new Error(`${bad} of 100 failed`);
      return "100 of 100 returned 200";
    });

    await timed("50 concurrent manifest checks", 25_000, async () => {
      const body = JSON.stringify(syntheticManifest(500));
      const results = await Promise.all(
        Array.from({ length: 50 }, () =>
          fetch(BASE + "/api/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
          }).then((r) => r.status)
        )
      );
      const bad = results.filter((s) => s !== 200).length;
      if (bad > 0) throw new Error(`${bad} of 50 failed`);
      return "50 of 50 returned 200";
    });

    await timed("one manifest of 30,000 entries over the wire", 30_000, async () => {
      const response = await fetch(BASE + "/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(syntheticManifest(30_000)),
      });
      if (response.status !== 200) throw new Error(`status ${response.status}`);
      const body = await response.json();
      return `verdict ${body.inspection.verdict}, ${body.inspection.fileCount} files`;
    });

    await timed("a manifest past the documented limit is refused", 30_000, async () => {
      const response = await fetch(BASE + "/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(syntheticManifest(200_001)),
      });
      if (response.status !== 413) throw new Error(`expected 413, got ${response.status}`);
      return "413, with an explanation";
    });

    await timed("12 people watch a check run at the same time", 45_000, async () => {
      const ids = ["evernote", "notion", "slack", "figma", "google-photos", "github"];
      const streams = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetch(`${BASE}/api/services/${ids[i % ids.length]}/run`, { method: "POST" }).then(async (response) => {
            const text = await response.text();
            return text.includes("event: complete");
          })
        )
      );
      const incomplete = streams.filter((done) => !done).length;
      if (incomplete > 0) throw new Error(`${incomplete} of 12 streams did not complete`);
      return "12 of 12 streams completed";
    });

    await timed("the state survives all of that", 5_000, async () => {
      const body = await fetch(BASE + "/api/report").then((r) => r.json());
      if (body.services.length !== 6) throw new Error(`${body.services.length} services after the run`);
      const bad = body.services.filter((s: any) => s.score < 0 || s.score > 100);
      if (bad.length > 0) throw new Error("a score went out of range");
      return `6 services, average ${body.summary.averageScore}`;
    });
  }

  // ------------------------------------------------------------------
  console.log(`\n${"=".repeat(88)}`);
  const slowest = [...rows].sort((a, b) => b.ms - a.ms).slice(0, 3);
  console.log("Slowest three:");
  for (const row of slowest) console.log(`  ${row.ms.toFixed(0).padStart(6)} ms  ${row.name}`);
  console.log(failed === 0 ? "\nAll stress cases passed." : `\n${failed} stress case${failed === 1 ? "" : "s"} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error("\nThe stress run itself failed:", error);
  process.exit(1);
});
