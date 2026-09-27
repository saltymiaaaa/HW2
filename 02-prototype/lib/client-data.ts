import { seedServices } from "./seed";
import { exitCost, portfolio } from "./score";
import { inspectManifest } from "./inspect";
import type { Inspection, Manifest, Service } from "./types";

/**
 * Dual-mode data layer.
 *
 * On a server deployment the pages call the API routes, which is the shape the
 * full product would take. On a static deployment (GitHub Pages) the same
 * maths runs in the browser: the seed portfolio is imported directly and the
 * manifest is inspected locally instead of being posted to /api/verify.
 */

export const STATIC_MODE = process.env.NEXT_PUBLIC_STATIC === "1";

export type ServiceRow = { service: Service; cost: ReturnType<typeof exitCost> };

function staticServices(): ServiceRow[] {
  return seedServices().map((s) => ({ service: s, cost: exitCost(s) }));
}

export async function loadServices(): Promise<ServiceRow[]> {
  if (STATIC_MODE) return staticServices();
  const r = await fetch("/api/services");
  const d = await r.json();
  return d.services;
}

export async function loadService(id: string): Promise<ServiceRow | null> {
  if (STATIC_MODE) {
    return staticServices().find((row) => row.service.id === id) ?? null;
  }
  const r = await fetch(`/api/services/${id}`);
  return r.ok ? await r.json() : null;
}

export type ReportPayload = {
  generatedAt: string;
  headline: string;
  summary: {
    count: number;
    hours: number;
    usd: number;
    monthly: number;
    averageScore: number;
    totalItems: number;
    strandedItems: number;
    failing: string[];
    unverified: string[];
    worst: { name: string; score: number; sentence: string } | null;
  };
  services: {
    id: string; name: string; category: string; score: number;
    band: ServiceRow["cost"]["band"]; bandReason?: string; sentence: string;
    hours: number; usd: number; lostTypes: string[];
    lastChecked: string | null; verdict: Service["snapshots"][number]["verdict"];
    factors: ServiceRow["cost"]["factors"];
  }[];
  events: { at: string; text: string }[];
};

export async function loadReport(): Promise<ReportPayload> {
  if (STATIC_MODE) return buildStaticReport();
  const r = await fetch("/api/report");
  return await r.json();
}

function buildStaticReport(): ReportPayload {
  const services = seedServices();
  const summary = portfolio(services);
  const headline =
    summary.count === 0
      ? "Nothing is being watched yet."
      : `Leaving everything you currently pay for would take about ${summary.hours} hours${summary.usd > 0 ? ` and $${summary.usd}` : ""}, and ${summary.strandedItems.toLocaleString("en-US")} of your ${summary.totalItems.toLocaleString("en-US")} items would not come with you.`;

  return {
    generatedAt: new Date().toISOString(),
    headline,
    summary: {
      count: summary.count,
      hours: summary.hours,
      usd: summary.usd,
      monthly: Number(summary.monthly.toFixed(2)),
      averageScore: summary.averageScore,
      totalItems: summary.totalItems,
      strandedItems: summary.strandedItems,
      failing: summary.failing,
      unverified: summary.unverified,
      worst: summary.worst
        ? { name: summary.worst.service.name, score: summary.worst.cost.score, sentence: summary.worst.cost.sentence }
        : null,
    },
    services: summary.costs.map(({ service, cost }) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      score: cost.score,
      band: cost.band,
      bandReason: cost.bandReason,
      sentence: cost.sentence,
      hours: cost.hours,
      usd: cost.usd,
      lostTypes: cost.lostTypes,
      lastChecked: service.snapshots[0]?.finishedAt ?? null,
      verdict: service.snapshots[0]?.verdict ?? "unknown",
      factors: cost.factors,
    })),
    events: [
      { at: new Date().toISOString(), text: "Exit Check started. This is the static build; scheduled runs need the server deployment." },
    ],
  };
}

export async function verifyManifest(manifest: Manifest): Promise<Inspection> {
  if (STATIC_MODE) return inspectManifest(manifest);
  const response = await fetch("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(manifest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "The check failed.");
  return data.inspection as Inspection;
}
