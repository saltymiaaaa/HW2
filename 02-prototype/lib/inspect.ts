import type { Inspection, InspectionFinding, Manifest, Verdict } from "./types";

/**
 * Turns a manifest into a verdict. The manifest is produced in the browser, so
 * the export itself never leaves the machine it was downloaded to. Only the
 * file names, sizes and parse results are sent here, which is the least a
 * server needs in order to say something true about an archive.
 *
 * This is the part of the product that separates a download from a backup.
 */

/** Formats a second program can open without the vendor's permission. */
const OPEN = new Set([
  "txt", "md", "markdown", "csv", "tsv", "json", "ndjson", "xml", "html", "htm",
  "jpg", "jpeg", "png", "gif", "webp", "svg", "tif", "tiff", "bmp", "heic",
  "mp3", "wav", "flac", "m4a", "ogg", "opus",
  "mp4", "mov", "webm", "mkv", "avi",
  "pdf", "epub", "ics", "vcf", "eml", "mbox", "srt", "vtt",
  "yml", "yaml", "toml", "ini", "sql", "db", "sqlite",
  "js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "java", "c", "h", "cpp", "css", "scss", "sh",
  "zip", "tar", "gz", "enex", "opml", "rtf", "docx", "xlsx", "pptx", "odt", "ods",
]);

/** Formats that only open inside the product that wrote them. */
const CLOSED: Record<string, string> = {
  fig: "Figma design file. Nothing outside Figma opens it.",
  sketch: "Sketch document. Readable only in Sketch.",
  xd: "Adobe XD document, and XD is no longer sold.",
  key: "Keynote document, which needs Apple hardware or an Apple account.",
  numbers: "Numbers spreadsheet, same restriction as Keynote.",
  pages: "Pages document, same restriction as Keynote.",
  indd: "InDesign document, which requires a current Adobe subscription.",
  psd: "Photoshop document. Other tools open it partially at best.",
  ai: "Illustrator document. Layers are lost outside Adobe.",
  note: "Proprietary note container.",
  onepkg: "OneNote package, which only OneNote unpacks.",
  one: "OneNote section, same restriction.",
  emlx: "Apple Mail container rather than standard EML.",
  pkpass: "Wallet pass, not a document.",
  dat: "Undocumented binary blob. Nothing can be promised about it.",
  bin: "Undocumented binary blob. Nothing can be promised about it.",
};

function extOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

/** Recognises the well known export layouts so the report can be specific. */
export function detectShape(manifest: Manifest): string {
  const paths = manifest.entries.map((e) => e.path.toLowerCase());
  const has = (needle: string) => paths.some((p) => p.includes(needle));
  const countExt = (ext: string) => manifest.entries.filter((e) => e.ext === ext).length;
  // A format has to dominate before the archive is named after it, or one
  // stray file renames the whole export.
  const dominant = (ext: string) => countExt(ext) > Math.max(1, manifest.entries.length * 0.3);

  if (dominant("enex")) return "Evernote export (ENEX)";
  if (has("channels.json") && has("users.json")) return "Slack workspace export";
  if (has("takeout/") || has("archive_browser.html")) return "Google Takeout archive";
  if (dominant("fig")) return "Figma file download";
  if (has("tweets.js") || has("data/account.js")) return "X or Twitter archive";
  if (has("messages/inbox") || has("your_activity")) return "Meta account download";
  if (paths.some((p) => /[0-9a-f]{32}\.(md|csv|html)$/.test(p))) return "Notion workspace export";
  if (has("posts.csv") && has("subscribers")) return "Substack export";
  if (dominant("mbox")) return "Mail archive (MBOX)";
  if (has(".git/") || has("head")) return "Git repository copy";
  if (manifest.kind === "csv") return "Single table (CSV)";
  if (manifest.kind === "json") return "Single JSON document";
  if (manifest.kind === "zip") return "Generic archive";
  return "Single file";
}

export function inspectManifest(manifest: Manifest): Inspection {
  const entries = manifest.entries.filter((e) => !e.path.endsWith("/"));
  const findings: InspectionFinding[] = [];

  const byExtMap = new Map<string, { count: number; bytes: number }>();
  for (const e of entries) {
    const key = e.ext || "(no extension)";
    const row = byExtMap.get(key) ?? { count: 0, bytes: 0 };
    row.count += 1;
    row.bytes += e.size;
    byExtMap.set(key, row);
  }

  const byExtension = [...byExtMap.entries()]
    .map(([ext, row]) => ({ ext, ...row, open: OPEN.has(ext) }))
    .sort((a, b) => b.bytes - a.bytes);

  const totalBytes = entries.reduce((n, e) => n + e.size, 0);
  const openBytes = entries.reduce((n, e) => n + (OPEN.has(e.ext) ? e.size : 0), 0);
  const openFormatRatio = totalBytes === 0 ? 0 : openBytes / totalBytes;

  const shape = detectShape(manifest);

  // 1. Files that were listed but could not be read.
  const failed = entries.filter((e) => e.parsed === "failed");
  if (failed.length > 0) {
    findings.push({
      level: "fail",
      title: `${failed.length} file${failed.length === 1 ? "" : "s"} listed but not readable`,
      detail: `The archive index names these files and the contents did not parse. Example: ${failed[0].path}${failed[0].parseNote ? ` (${failed[0].parseNote})` : ""}.`,
    });
  }

  // 2. Proprietary containers.
  const closed = byExtension.filter((x) => CLOSED[x.ext]);
  if (closed.length > 0) {
    const worst = closed.sort((a, b) => b.bytes - a.bytes)[0];
    findings.push({
      level: worst.bytes / Math.max(1, totalBytes) > 0.3 ? "fail" : "warn",
      title: `${Math.round((closed.reduce((n, c) => n + c.bytes, 0) / Math.max(1, totalBytes)) * 100)} percent of this archive is in a closed format`,
      detail: `${worst.count} .${worst.ext} file${worst.count === 1 ? "" : "s"}. ${CLOSED[worst.ext]} A copy you cannot open is storage, not an exit.`,
    });
  }

  // 3. Empty files, the quiet failure mode of a resumed download.
  const empty = entries.filter((e) => e.size === 0);
  if (empty.length > 0) {
    findings.push({
      level: empty.length > entries.length * 0.02 ? "fail" : "warn",
      title: `${empty.length} file${empty.length === 1 ? " is" : "s are"} zero bytes`,
      detail: `A zero byte file passes a file count check and holds nothing. First one: ${empty[0].path}.`,
    });
  }

  // 4. Nested archives, which hide their own contents from every count.
  const nested = entries.filter((e) => ["zip", "tar", "gz", "7z", "rar"].includes(e.ext));
  if (nested.length > 0) {
    findings.push({
      level: "warn",
      title: `${nested.length} archive${nested.length === 1 ? "" : "s"} inside this archive`,
      detail: "Nested archives are not counted by any figure above. Unpack them and check each one, or the total is a guess.",
    });
  }

  // 5. Sidecar metadata, present but invisible to the tool that reads the files.
  const sidecars = entries.filter((e) => /\.(jpg|jpeg|png|heic|mp4|mov)\.json$/i.test(e.path));
  if (sidecars.length > 0) {
    findings.push({
      level: "warn",
      title: `${sidecars.length} metadata sidecar file${sidecars.length === 1 ? "" : "s"}`,
      detail: "Dates, captions and locations are stored beside the media rather than inside it. Most photo tools ignore these files on import, so the data is present and still gets lost.",
    });
  }

  // 6. An export made only of rendered pages rather than data.
  const htmlBytes = byExtension.filter((x) => x.ext === "html" || x.ext === "htm").reduce((n, x) => n + x.bytes, 0);
  const dataBytes = byExtension.filter((x) => ["json", "csv", "md", "xml", "ndjson"].includes(x.ext)).reduce((n, x) => n + x.bytes, 0);
  if (htmlBytes > 0 && dataBytes === 0 && entries.length > 5) {
    findings.push({
      level: "warn",
      title: "This export is rendered pages, not data",
      detail: "HTML preserves what the screen looked like and loses the structure underneath it. Reimporting it anywhere means parsing the layout back out.",
    });
  }

  // 7. Paths that will not survive a restore on Windows.
  const illegal = entries.filter((e) => /[:*?"<>|]/.test(e.path.replace(/^[A-Za-z]:/, "")) || e.path.length > 240);
  if (illegal.length > 0) {
    findings.push({
      level: "warn",
      title: `${illegal.length} path${illegal.length === 1 ? "" : "s"} will not restore on Windows`,
      detail: `Either longer than 240 characters or containing a reserved character. Example: ${illegal[0].path.slice(0, 90)}...`,
    });
  }

  // 8. Duplicate paths, which mean a restore silently drops one of them.
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const e of entries) {
    const key = e.path.toLowerCase();
    if (seen.has(key)) dupes.add(key);
    seen.add(key);
  }
  if (dupes.size > 0) {
    findings.push({
      level: "warn",
      title: `${dupes.size} duplicated path${dupes.size === 1 ? "" : "s"}`,
      detail: "Two entries claim the same location. On restore one overwrites the other and nothing reports it.",
    });
  }

  // 9. The positive case, stated as plainly as the failures.
  if (openFormatRatio >= 0.95 && failed.length === 0 && empty.length === 0) {
    findings.push({
      level: "ok",
      title: "Everything in here opens without the vendor",
      detail: `${entries.length.toLocaleString("en-US")} files, all in formats another program reads. This archive would still be useful if the company behind it closed tomorrow.`,
    });
  }

  if (manifest.truncated) {
    findings.push({
      level: "warn",
      title: "Only the first part of the archive was read",
      detail: "The file is large, so the listing was cut short. Counts above are a floor, not a total.",
    });
  }

  const fails = findings.filter((f) => f.level === "fail").length;
  const warns = findings.filter((f) => f.level === "warn").length;

  const verdict: Verdict =
    entries.length === 0
      ? "unknown"
      : fails > 0 || openFormatRatio < 0.25
        ? failed.length > entries.length * 0.33
          ? "unreadable"
          : "lossy"
        : warns > 0
          ? "lossy"
          : "readable";

  const sentence =
    entries.length === 0
      ? "Nothing readable was found in this file, so there is nothing to judge yet."
      : verdict === "readable"
        ? `This is a real backup. ${entries.length.toLocaleString("en-US")} files, ${Math.round(openFormatRatio * 100)} percent of them openable by something other than the vendor, and nothing failed to parse.`
        : verdict === "lossy"
          ? `This opens, and it is not a complete exit. ${Math.round(openFormatRatio * 100)} percent of the bytes are in an open format and ${fails + warns} issue${fails + warns === 1 ? "" : "s"} below would cost you time on the day you actually leave.`
          : `This archive does not reliably open. ${failed.length} of ${entries.length} files failed to parse, so treat it as a download rather than a backup.`;

  return {
    verdict,
    shape,
    fileCount: entries.length,
    totalBytes,
    openBytes,
    openFormatRatio,
    byExtension: byExtension.slice(0, 14),
    findings,
    sentence,
  };
}

export { OPEN as OPEN_FORMATS, CLOSED as CLOSED_FORMATS, extOf };
