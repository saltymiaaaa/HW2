// Shared vocabulary for the whole product. Every route, page and scoring
// function speaks in these terms, so a change here is a change everywhere.

/** How much of an item type survives the platform's own export. */
export type Coverage = "full" | "partial" | "none";

/** How the export is obtained. Each step a human has to perform is friction. */
export type ExportMethod = "api" | "manual" | "request" | "none";

/** What the platform does with your data after you stop paying. */
export type DeletionPolicy = "read-only" | "grace" | "delete";

export type Schedule = "daily" | "weekly" | "monthly" | "off";

/** The result of opening the export rather than merely downloading it. */
export type Verdict = "readable" | "lossy" | "unreadable" | "unknown";

export interface ItemType {
  key: string;
  label: string;
  /** How many of these you hold on the platform. */
  count: number;
  coverage: Coverage;
  /**
   * When coverage is partial, the share that actually survives. Ninety days of
   * a six year archive is partial, and so is a formula that arrives as a value,
   * and calling both of them "half" would be a lie the score then inherits.
   */
  recovered?: number;
  /** Plain sentence describing what happens to this item type on export. */
  note: string;
}

export interface PricePoint {
  /** ISO date, first of the month. */
  date: string;
  usd: number;
}

export interface Snapshot {
  id: string;
  serviceId: string;
  startedAt: string;
  finishedAt: string;
  /** Size of the stored copy, in bytes. */
  sizeBytes: number;
  fileCount: number;
  verdict: Verdict;
  /** Item types that did not come out at all. */
  missing: string[];
  /** Item types that came out in a reduced form. */
  degraded: string[];
  /** Human readable observations, newest run first. */
  notes: string[];
  /** Exit cost at the moment of the run, so drift over time is visible. */
  exitCost: number;
  /** Change against the previous snapshot, in items. */
  delta: { added: number; removed: number; changed: number };
}

export interface Service {
  id: string;
  name: string;
  vendor: string;
  category: string;
  /** One line describing what you keep there. */
  holds: string;
  plan: string;
  monthlyUsd: number;
  /** How long your data has been on the platform, in years. */
  yearsStored: number;
  exportMethod: ExportMethod;
  exportFormats: string[];
  /** Share of the exported bytes that land in a format another tool can open. */
  openFormatRatio: number;
  itemTypes: ItemType[];
  priceHistory: PricePoint[];
  deletion: { policy: DeletionPolicy; graceDays: number; note: string };
  /** What it would take to be running again somewhere else. */
  reentry: { hours: number; usd: number; note: string };
  /** Where the destination copy is written. The user owns this location. */
  destination: string;
  schedule: Schedule;
  snapshots: Snapshot[];
  /** Set when the user added the service by hand rather than from the demo set. */
  custom?: boolean;
}

export interface Factor {
  key: string;
  label: string;
  /** 0 means leaving is free on this axis, 1 means it is as bad as it gets. */
  value: number;
  weight: number;
  /** What the number was read from, so the score can be argued with. */
  evidence: string;
}

export interface ExitCost {
  score: number;
  band: "portable" | "sticky" | "trapped";
  /** Set when the band was raised by a rule rather than by the weighted score. */
  bandReason?: string;
  factors: Factor[];
  /** The one sentence the whole product exists to produce. */
  sentence: string;
  hours: number;
  usd: number;
  lostTypes: string[];
}

/** A file seen inside an export, described without its contents. */
export interface ManifestEntry {
  path: string;
  size: number;
  ext: string;
  /** Set when the browser managed to parse the file, not just list it. */
  parsed?: "ok" | "failed";
  parseNote?: string;
}

export interface Manifest {
  sourceName: string;
  sourceSize: number;
  kind: "zip" | "json" | "csv" | "xml" | "text" | "unknown";
  entries: ManifestEntry[];
  truncated: boolean;
}

export interface InspectionFinding {
  level: "ok" | "warn" | "fail";
  title: string;
  detail: string;
}

export interface Inspection {
  verdict: Verdict;
  shape: string;
  fileCount: number;
  totalBytes: number;
  openBytes: number;
  openFormatRatio: number;
  byExtension: { ext: string; count: number; bytes: number; open: boolean }[];
  findings: InspectionFinding[];
  /** Same sentence style as the exit cost report, applied to a real archive. */
  sentence: string;
}
