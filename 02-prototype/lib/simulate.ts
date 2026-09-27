import { exitCost } from "./score";
import type { Service, Snapshot, Verdict } from "./types";

/**
 * A check run, expressed as steps so the interface can show what is happening
 * rather than a spinner. In the prototype the transfer is simulated and the
 * reasoning is not: every finding below is derived from the service record,
 * which is the same record the scoring function reads.
 *
 * Replacing the simulated download with a real connector means implementing
 * `fetchExport` per service and leaving the rest of this file alone.
 */

export interface RunStep {
  key: string;
  label: string;
  detail: string;
  /** How long the step takes in the demo, in milliseconds. */
  ms: number;
  findings: { level: "ok" | "warn" | "fail"; text: string }[];
}

const METHOD_STEP: Record<Service["exportMethod"], { label: string; detail: string; ms: number }> = {
  api: {
    label: "Requesting the export",
    detail: "The platform exposes an API, so no one has to click anything.",
    ms: 700,
  },
  manual: {
    label: "Requesting the export",
    detail: "This platform only exports from its own interface, so the request is replayed as a signed in session.",
    ms: 1500,
  },
  request: {
    label: "Requesting the export",
    detail: "The platform builds the archive on its own schedule and mails a link when it is ready.",
    ms: 2200,
  },
  none: {
    label: "Requesting the export",
    detail: "There is no export endpoint. The copy is assembled page by page.",
    ms: 2600,
  },
};

export function planRun(service: Service): RunStep[] {
  const previous = service.snapshots[0];
  const bytes = previous?.sizeBytes ?? 500_000_000;
  const missing = service.itemTypes.filter((t) => t.coverage === "none");
  const partial = service.itemTypes.filter((t) => t.coverage === "partial");
  const full = service.itemTypes.filter((t) => t.coverage === "full");
  const cost = exitCost(service);

  const steps: RunStep[] = [];

  steps.push({
    key: "connect",
    label: `Connecting to ${service.name}`,
    detail: `Signing in as you on the ${service.plan} plan.`,
    ms: 600,
    findings: [{ level: "ok", text: `Connected. ${service.vendor} is the party that controls this data today.` }],
  });

  const method = METHOD_STEP[service.exportMethod];
  steps.push({
    key: "request",
    label: method.label,
    detail: method.detail,
    ms: method.ms,
    findings: [
      {
        level: service.exportMethod === "api" ? "ok" : service.exportMethod === "none" ? "fail" : "warn",
        text:
          service.exportMethod === "api"
            ? "The export can run unattended, which is the only way a weekly check stays honest."
            : service.exportMethod === "request"
              ? "A human has to accept a mailed link. That is the step most people stop at."
              : service.exportMethod === "none"
                ? "No export exists, so the copy can never be complete by definition."
                : "The export is a manual action, so it will be skipped in any month you are busy.",
      },
    ],
  });

  steps.push({
    key: "download",
    label: "Writing the copy to your own storage",
    detail: `Destination ${service.destination}. Exit Check never keeps the only copy.`,
    ms: Math.min(3000, 800 + bytes / 4_000_000),
    findings: [{ level: "ok", text: `${formatBytes(bytes)} written to a location you control.` }],
  });

  steps.push({
    key: "open",
    label: "Opening the archive",
    detail: "A download that cannot be opened is not a backup. Every file is read, not just counted.",
    ms: 1400,
    findings: [
      {
        level: "ok",
        text: `Archive opened. Formats present: ${service.exportFormats.join(", ")}.`,
      },
      {
        level: service.openFormatRatio >= 0.8 ? "ok" : service.openFormatRatio >= 0.5 ? "warn" : "fail",
        text: `${Math.round(service.openFormatRatio * 100)} percent of the bytes are in a format another program can open.`,
      },
    ],
  });

  steps.push({
    key: "inventory",
    label: "Checking each item type against the platform",
    detail: "The platform is asked how many of each thing you hold, and the archive is asked the same question.",
    ms: 1800,
    findings: [
      ...full.map((t) => ({ level: "ok" as const, text: `${t.label}: ${t.count.toLocaleString("en-US")} of ${t.count.toLocaleString("en-US")} present. ${t.note}` })),
      ...partial.map((t) => ({ level: "warn" as const, text: `${t.label}: present in a reduced form. ${t.note}` })),
      ...missing.map((t) => ({ level: "fail" as const, text: `${t.label}: absent. ${t.note}` })),
    ],
  });

  const delta = previous
    ? { added: Math.round(previous.delta.added * 0.8) + 3, removed: 0, changed: Math.round(previous.delta.changed * 0.6) }
    : { added: 0, removed: 0, changed: 0 };

  steps.push({
    key: "diff",
    label: "Comparing against the last copy",
    detail: previous
      ? `Last checked ${new Date(previous.finishedAt).toLocaleDateString("en-GB")}.`
      : "First run, so there is nothing to compare against yet.",
    ms: 900,
    findings: previous
      ? [
          { level: "ok", text: `${delta.added} new items, ${delta.changed} changed, ${delta.removed} removed since the last copy.` },
          ...(previous.exitCost !== cost.score
            ? [
                {
                  level: cost.score > previous.exitCost ? ("warn" as const) : ("ok" as const),
                  text: `Exit cost moved from ${previous.exitCost} to ${cost.score} since the last run.`,
                },
              ]
            : []),
        ]
      : [{ level: "ok", text: "Baseline recorded. Drift becomes visible from the next run." }],
  });

  steps.push({
    key: "score",
    label: "Answering the question",
    detail: "One sentence, in hours and in what is left behind.",
    ms: 700,
    findings: [{ level: cost.band === "portable" ? "ok" : cost.band === "sticky" ? "warn" : "fail", text: cost.sentence }],
  });

  return steps;
}

export function buildSnapshot(service: Service): Snapshot {
  const cost = exitCost(service);
  const previous = service.snapshots[0];
  const missing = service.itemTypes.filter((t) => t.coverage === "none").map((t) => t.label);
  const degraded = service.itemTypes.filter((t) => t.coverage === "partial").map((t) => t.label);

  const verdict: Verdict =
    service.exportMethod === "none"
      ? "unreadable"
      : missing.length === 0 && degraded.length === 0
        ? "readable"
        : "lossy";

  const now = new Date().toISOString();
  const grow = 1 + (Math.random() * 0.02 - 0.002);

  return {
    id: `${service.id}-${Date.now().toString(36)}`,
    serviceId: service.id,
    startedAt: now,
    finishedAt: now,
    sizeBytes: Math.round((previous?.sizeBytes ?? 500_000_000) * grow),
    fileCount: Math.round((previous?.fileCount ?? 100) * grow),
    verdict,
    missing,
    degraded,
    notes: [
      verdict === "readable"
        ? "Every file in the archive opened and every item type is accounted for."
        : "The archive opened. The gap is in what the platform puts inside it, not in the transfer.",
      cost.sentence,
    ],
    exitCost: cost.score,
    delta: previous
      ? { added: Math.round(previous.delta.added * 0.8) + 3, removed: 0, changed: Math.round(previous.delta.changed * 0.6) }
      : { added: 0, removed: 0, changed: 0 },
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}
