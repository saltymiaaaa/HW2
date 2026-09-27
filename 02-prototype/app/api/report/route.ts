import { NextResponse } from "next/server";
import { portfolio } from "@/lib/score";
import { listEvents, listServices } from "@/lib/store";

export const dynamic = "force-dynamic";

/** The whole portfolio in one answer, which is what the printable report renders. */
export async function GET() {
  const services = listServices();
  const summary = portfolio(services);

  const headline =
    summary.count === 0
      ? "Nothing is being watched yet."
      : `Leaving everything you currently pay for would take about ${summary.hours} hours${summary.usd > 0 ? ` and $${summary.usd}` : ""}, and ${summary.strandedItems.toLocaleString("en-US")} of your ${summary.totalItems.toLocaleString("en-US")} items would not come with you.`;

  return NextResponse.json({
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
    events: listEvents().slice(0, 20),
  });
}
