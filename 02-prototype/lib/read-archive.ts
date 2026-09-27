"use client";

import { Unzip, UnzipInflate, unzip } from "fflate";
import { extOf } from "./inspect";
import type { Manifest, ManifestEntry } from "./types";

/**
 * Reads a real export archive inside the browser.
 *
 * This runs on the machine that downloaded the export, and only the resulting
 * manifest is sent to the server. A product that asks people to prove they can
 * leave a platform should not begin by uploading everything they own to a new
 * one.
 *
 * Small archives are decompressed so files can actually be parsed. Large ones
 * are listed from the archive index only, and the manifest says so.
 */

/** Above this size the archive is listed rather than opened, to stay inside browser memory. */
const FULL_READ_LIMIT = 220 * 1024 * 1024;
/** Files larger than this are listed but not parsed. */
const PARSE_LIMIT = 2 * 1024 * 1024;
/** How many files get a content check, so a 80,000 file archive still finishes. */
const PARSE_BUDGET = 400;

const MAGIC: { ext: string[]; bytes: number[]; label: string }[] = [
  { ext: ["jpg", "jpeg"], bytes: [0xff, 0xd8, 0xff], label: "JPEG" },
  { ext: ["png"], bytes: [0x89, 0x50, 0x4e, 0x47], label: "PNG" },
  { ext: ["gif"], bytes: [0x47, 0x49, 0x46, 0x38], label: "GIF" },
  { ext: ["pdf"], bytes: [0x25, 0x50, 0x44, 0x46], label: "PDF" },
  { ext: ["zip", "docx", "xlsx", "pptx"], bytes: [0x50, 0x4b], label: "ZIP container" },
  { ext: ["gz"], bytes: [0x1f, 0x8b], label: "gzip" },
];

function checkMagic(name: string, data: Uint8Array): ManifestEntry["parseNote"] | null {
  const ext = extOf(name);
  const rule = MAGIC.find((m) => m.ext.includes(ext));
  if (!rule) return null;
  const ok = rule.bytes.every((b, i) => data[i] === b);
  return ok ? null : `named .${ext} but the first bytes are not ${rule.label}`;
}

function checkText(name: string, data: Uint8Array): { parsed: "ok" | "failed"; note?: string } {
  const ext = extOf(name);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return { parsed: "failed", note: "not valid UTF-8 text" };
  }

  if (ext === "json") {
    try {
      JSON.parse(text);
    } catch (e) {
      return { parsed: "failed", note: `JSON did not parse: ${(e as Error).message.slice(0, 60)}` };
    }
  }

  if (ext === "ndjson") {
    const lines = text.split("\n").filter((l) => l.trim());
    for (const line of lines.slice(0, 200)) {
      try {
        JSON.parse(line);
      } catch {
        return { parsed: "failed", note: "a line in this NDJSON file is not valid JSON" };
      }
    }
  }

  if (ext === "csv" || ext === "tsv") {
    const sep = ext === "tsv" ? "\t" : ",";
    const rows = text.split(/\r?\n/).filter((r) => r.length > 0).slice(0, 500);
    if (rows.length > 1) {
      const width = rows[0].split(sep).length;
      const ragged = rows.filter((r) => r.split(sep).length !== width).length;
      // Quoted commas make this approximate, so only a clear majority counts.
      if (ragged > rows.length * 0.25) {
        return { parsed: "failed", note: `${ragged} of ${rows.length} rows do not match the header width` };
      }
    }
  }

  if (ext === "xml" || ext === "enex" || ext === "opml" || ext === "svg") {
    const opens = (text.match(/<[a-zA-Z]/g) ?? []).length;
    const closes = (text.match(/<\/[a-zA-Z]/g) ?? []).length + (text.match(/\/>/g) ?? []).length;
    if (opens === 0) return { parsed: "failed", note: "no markup found in a file that claims to be XML" };
    if (closes < opens * 0.4) return { parsed: "failed", note: "tags are not closed, the file looks truncated" };
  }

  return { parsed: "ok" };
}

const TEXTY = new Set(["json", "ndjson", "csv", "tsv", "xml", "enex", "opml", "svg", "md", "markdown", "txt", "html", "htm", "yml", "yaml"]);

function inspectEntry(name: string, data: Uint8Array, budget: { left: number }): ManifestEntry {
  const entry: ManifestEntry = { path: name, size: data.length, ext: extOf(name) };
  if (data.length === 0) return entry;

  const magicNote = checkMagic(name, data);
  if (magicNote) {
    entry.parsed = "failed";
    entry.parseNote = magicNote;
    return entry;
  }

  if (budget.left > 0 && TEXTY.has(entry.ext) && data.length <= PARSE_LIMIT) {
    budget.left -= 1;
    const result = checkText(name, data);
    entry.parsed = result.parsed;
    if (result.note) entry.parseNote = result.note;
  } else if (magicNote === null && MAGIC.some((m) => m.ext.includes(entry.ext))) {
    entry.parsed = "ok";
  }

  return entry;
}

async function listLargeZip(file: File, onProgress?: (n: number) => void): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  const unzipper = new Unzip();
  unzipper.register(UnzipInflate);
  unzipper.onfile = (f) => {
    entries.push({
      path: f.name,
      // The local header does not always carry the real size, so fall back to 0
      // rather than guessing. The manifest is marked truncated in this path anyway.
      size: f.originalSize ?? 0,
      ext: extOf(f.name),
    });
    // Never call f.start(), so nothing is decompressed.
  };

  const reader = file.stream().getReader();
  let read = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    read += value.length;
    onProgress?.(read / file.size);
    unzipper.push(value, false);
  }
  unzipper.push(new Uint8Array(0), true);
  return entries;
}

function unzipAll(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, out) => (err ? reject(err) : resolve(out)));
  });
}

export async function readArchive(
  file: File,
  onProgress?: (fraction: number, label: string) => void
): Promise<Manifest> {
  const ext = extOf(file.name);
  const isZip = ext === "zip" || file.type === "application/zip";

  if (isZip && file.size > FULL_READ_LIMIT) {
    onProgress?.(0.05, "Archive is large, reading the index only");
    const entries = await listLargeZip(file, (f) => onProgress?.(0.05 + f * 0.9, "Reading the archive index"));
    return {
      sourceName: file.name,
      sourceSize: file.size,
      kind: "zip",
      entries,
      truncated: true,
    };
  }

  onProgress?.(0.1, "Loading the file");
  const buffer = new Uint8Array(await file.arrayBuffer());

  if (isZip) {
    onProgress?.(0.35, "Opening the archive");
    const files = await unzipAll(buffer);
    const names = Object.keys(files);
    const budget = { left: PARSE_BUDGET };
    const entries: ManifestEntry[] = [];
    let i = 0;
    for (const name of names) {
      if (name.endsWith("/")) continue;
      entries.push(inspectEntry(name, files[name], budget));
      i += 1;
      if (i % 250 === 0) {
        onProgress?.(0.35 + (i / names.length) * 0.6, `Checking file ${i} of ${names.length}`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    onProgress?.(1, "Done");
    return { sourceName: file.name, sourceSize: file.size, kind: "zip", entries, truncated: false };
  }

  onProgress?.(0.6, "Checking the file");
  const budget = { left: PARSE_BUDGET };
  const entry = inspectEntry(file.name, buffer, budget);
  const kind: Manifest["kind"] =
    ext === "json" || ext === "ndjson"
      ? "json"
      : ext === "csv" || ext === "tsv"
        ? "csv"
        : ext === "xml" || ext === "enex"
          ? "xml"
          : ext === "md" || ext === "txt" || ext === "html"
            ? "text"
            : "unknown";

  onProgress?.(1, "Done");
  return { sourceName: file.name, sourceSize: file.size, kind, entries: [entry], truncated: false };
}
