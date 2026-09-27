import { NextResponse } from "next/server";
import { exitCost } from "@/lib/score";
import { addService, listServices } from "@/lib/store";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

/** The portfolio, each service with the score attached so the client does no maths. */
export async function GET() {
  const services = listServices().map((s) => ({ service: s, cost: exitCost(s) }));
  return NextResponse.json({ services });
}

/**
 * Adds a service by hand. Only the fields that cannot be guessed are required,
 * because a half filled record that produces an honest score is better than a
 * complete record nobody fills in.
 */
export async function POST(request: Request) {
  let body: Partial<Service>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body was not valid JSON." }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "A service needs a name." }, { status: 400 });
  }

  const id = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (listServices().some((s) => s.id === id)) {
    return NextResponse.json({ error: `${body.name} is already in the portfolio.` }, { status: 409 });
  }

  const service: Service = {
    id,
    name: body.name,
    vendor: body.vendor ?? "Unknown",
    category: body.category ?? "Uncategorised",
    holds: body.holds ?? "Not described yet.",
    plan: body.plan ?? "Unknown plan",
    monthlyUsd: Number(body.monthlyUsd ?? 0),
    yearsStored: Number(body.yearsStored ?? 1),
    exportMethod: body.exportMethod ?? "manual",
    exportFormats: body.exportFormats ?? ["unknown"],
    openFormatRatio: Number(body.openFormatRatio ?? 0.5),
    itemTypes: body.itemTypes ?? [
      { key: "items", label: "Everything you keep here", count: 1, coverage: "partial", note: "Not checked yet. Run a check to replace this guess with a measurement." },
    ],
    priceHistory: body.priceHistory ?? [{ date: new Date().toISOString().slice(0, 10), usd: Number(body.monthlyUsd ?? 0) }],
    deletion: body.deletion ?? { policy: "delete", graceDays: 0, note: "Deletion policy not recorded yet, so the worst case is assumed." },
    reentry: body.reentry ?? { hours: 8, usd: 0, note: "estimate, not measured" },
    destination: body.destination ?? `~/ExitCheck/${id}`,
    schedule: body.schedule ?? "monthly",
    snapshots: [],
    custom: true,
  };

  addService(service);
  return NextResponse.json({ service, cost: exitCost(service) }, { status: 201 });
}
