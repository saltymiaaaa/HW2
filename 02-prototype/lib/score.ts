import type { Coverage, ExitCost, Factor, Service } from "./types";

/**
 * Exit cost is deliberately arithmetic rather than a model output. Every number
 * below can be traced to a field on the service, which means a user who
 * disagrees with the score can point at the line that produced it.
 *
 * 0 means you could walk out today. 100 means the data is effectively hostage.
 */

const clamp = (n: number) => Math.max(0, Math.min(1, n));

const FRICTION: Record<Service["exportMethod"], number> = {
  api: 0.05,
  manual: 0.45,
  request: 0.8,
  none: 1,
};

const FRICTION_EVIDENCE: Record<Service["exportMethod"], string> = {
  api: "export runs unattended over an API",
  manual: "export has to be started by hand in the interface",
  request: "export has to be requested and waited for",
  none: "no export exists, the data has to be scraped",
};

/** Compound annual growth of the subscription price, as a fraction. */
export function priceGrowth(service: Service): number {
  const points = [...service.priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return 0;
  const first = points[0];
  const last = points[points.length - 1];
  if (first.usd <= 0) return 0;
  const years = Math.max(
    0.5,
    (Date.parse(last.date) - Date.parse(first.date)) / (365.25 * 24 * 3600 * 1000)
  );
  return Math.pow(last.usd / first.usd, 1 / years) - 1;
}

/** The share of one item type that comes back, between 0 and 1. */
export function survives(t: { coverage: Coverage; recovered?: number }): number {
  if (t.coverage === "full") return 1;
  if (t.coverage === "none") return 0;
  // Partial without a measured figure is assumed to be a little under half.
  return Math.max(0, Math.min(1, t.recovered ?? 0.45));
}

export function completeness(service: Service): { covered: number; total: number } {
  const total = service.itemTypes.reduce((n, t) => n + t.count, 0);
  const covered = service.itemTypes.reduce((n, t) => n + t.count * survives(t), 0);
  return { covered, total };
}

export function exitCost(service: Service): ExitCost {
  const { covered, total } = completeness(service);
  const missingShare = total === 0 ? 0 : 1 - covered / total;

  const lostTypes = service.itemTypes
    .filter((t) => t.coverage !== "full")
    .map((t) => t.label);

  const growth = priceGrowth(service);

  const deletionValue =
    service.deletion.policy === "read-only"
      ? 0
      : service.deletion.policy === "grace"
        ? clamp(1 - service.deletion.graceDays / 180) * 0.7
        : 1;

  const reentryValue = clamp(
    0.6 * clamp(service.reentry.hours / 40) + 0.4 * clamp(service.reentry.usd / 600)
  );

  const factors: Factor[] = [
    {
      key: "completeness",
      label: "What the export leaves behind",
      // Concave, because the first thing the export drops already costs you the
      // confidence that any of it is complete.
      value: clamp(Math.pow(missingShare, 0.7)),
      weight: 0.32,
      evidence:
        lostTypes.length === 0
          ? "every item type comes out in full"
          : `${lostTypes.length} of ${service.itemTypes.length} item types come out reduced or not at all`,
    },
    {
      key: "format",
      label: "Whether another tool can open it",
      value: clamp(1 - service.openFormatRatio),
      weight: 0.14,
      evidence: `${Math.round(service.openFormatRatio * 100)} percent of the export lands in an open format (${service.exportFormats.join(", ")})`,
    },
    {
      key: "friction",
      label: "Work required to get the export at all",
      value: FRICTION[service.exportMethod],
      weight: 0.1,
      evidence: FRICTION_EVIDENCE[service.exportMethod],
    },
    {
      key: "reentry",
      label: "Cost of being running somewhere else",
      value: reentryValue,
      weight: 0.20,
      evidence: `${service.reentry.hours} hours and ${service.reentry.usd === 0 ? "no direct spend" : "$" + service.reentry.usd} to rebuild (${service.reentry.note})`,
    },
    {
      key: "price",
      label: "How fast the price moves under you",
      value: clamp(growth / 0.25),
      weight: 0.14,
      evidence:
        growth <= 0.001
          ? "price has not moved since you signed up"
          : `price has risen ${Math.round(growth * 100)} percent a year since you signed up`,
    },
    {
      key: "deletion",
      label: "What happens after you stop paying",
      value: deletionValue,
      weight: 0.1,
      evidence: service.deletion.note,
    },
  ];

  const raw = factors.reduce((n, f) => n + f.value * f.weight, 0);
  const score = Math.round(raw * 100);

  // Calibrated against the demo portfolio: a service you could leave over a
  // weekend scores under 30.
  let band: ExitCost["band"] = score < 30 ? "portable" : score < 55 ? "sticky" : "trapped";
  let bandReason: string | undefined;

  // A weighted average can hide the one thing that matters. If a quarter of
  // what you hold cannot come out at all, the move being quick is irrelevant,
  // so volume of permanent loss overrides the arithmetic.
  const strandedShare =
    total === 0
      ? 0
      : service.itemTypes.reduce((n, t) => n + (survives(t) < 0.1 ? t.count : 0), 0) / total;

  if (strandedShare > 0.25 && band !== "trapped") {
    band = "trapped";
    bandReason = `${Math.round(strandedShare * 100)} percent of what you hold here cannot be exported at all, which no amount of speed elsewhere makes up for.`;
  }

  const lostPhrase =
    lostTypes.length === 0
      ? "and nothing would be left behind"
      : `and you would leave behind ${listPhrase(lostTypes)}`;

  const moneyPhrase = service.reentry.usd === 0 ? "no direct spend" : `$${service.reentry.usd}`;

  const sentence = `Leaving ${service.name} today would take about ${service.reentry.hours} hours and ${moneyPhrase}, ${lostPhrase}.`;

  return {
    score,
    band,
    bandReason,
    factors,
    sentence,
    hours: service.reentry.hours,
    usd: service.reentry.usd,
    lostTypes,
  };
}

export function listPhrase(items: string[]): string {
  const lower = items.map((s) => s.toLowerCase());
  if (lower.length === 0) return "nothing";
  if (lower.length === 1) return lower[0];
  if (lower.length === 2) return `${lower[0]} and ${lower[1]}`;
  return `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`;
}

export function bandLabel(band: ExitCost["band"]): string {
  return band === "portable"
    ? "Portable"
    : band === "sticky"
      ? "Sticky"
      : "Trapped";
}

/** Portfolio level reading, used by the report page and the API. */
export function portfolio(services: Service[]) {
  const costs = services.map((s) => ({ service: s, cost: exitCost(s) }));
  const hours = costs.reduce((n, c) => n + c.cost.hours, 0);
  const usd = costs.reduce((n, c) => n + c.cost.usd, 0);
  const monthly = services.reduce((n, s) => n + s.monthlyUsd, 0);
  const unverified = services.filter(
    (s) => s.snapshots.length === 0 || s.snapshots[0].verdict === "unknown"
  );
  const failing = costs.filter((c) => c.cost.band === "trapped");
  const sorted = [...costs].sort((a, b) => b.cost.score - a.cost.score);
  const worst = sorted[0];
  const averageScore =
    costs.length === 0 ? 0 : Math.round(costs.reduce((n, c) => n + c.cost.score, 0) / costs.length);

  const totalItems = services.reduce(
    (n, s) => n + s.itemTypes.reduce((m, t) => m + t.count, 0),
    0
  );
  const strandedItems = services.reduce(
    (n, s) =>
      n +
      s.itemTypes.reduce((m, t) => m + t.count * (1 - survives(t)), 0),
    0
  );

  return {
    count: services.length,
    hours,
    usd,
    monthly,
    averageScore,
    worst,
    failing: failing.map((f) => f.service.name),
    unverified: unverified.map((s) => s.name),
    totalItems,
    strandedItems: Math.round(strandedItems),
    costs: sorted,
  };
}
