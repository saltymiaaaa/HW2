import { NextResponse } from "next/server";
import { inspectManifest } from "@/lib/inspect";
import { log } from "@/lib/store";
import type { Manifest } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Scores a real export archive.
 *
 * The archive itself is not uploaded. The browser opens it, parses what it can
 * and posts the manifest, which is names, sizes and parse results. That keeps
 * the contents on the user's machine and keeps this endpoint inside the
 * request size limits of a serverless function at the same time.
 */
export async function POST(request: Request) {
  let manifest: Manifest;
  try {
    manifest = (await request.json()) as Manifest;
  } catch {
    return NextResponse.json({ error: "Body was not valid JSON." }, { status: 400 });
  }

  if (!manifest || !Array.isArray(manifest.entries)) {
    return NextResponse.json(
      { error: "A manifest needs an entries array. Read the archive in the browser first." },
      { status: 400 }
    );
  }

  if (manifest.entries.length > 200_000) {
    return NextResponse.json(
      { error: "That manifest is larger than this endpoint accepts. Split the archive and check it in parts." },
      { status: 413 }
    );
  }

  const inspection = inspectManifest(manifest);
  log(
    `Checked ${manifest.sourceName}: ${inspection.shape}, verdict ${inspection.verdict}, ${inspection.fileCount} files.`
  );

  return NextResponse.json({ inspection, manifest: { ...manifest, entries: [] } });
}
