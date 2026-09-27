import { NextResponse } from "next/server";
import { exitCost } from "@/lib/score";
import { buildSnapshot } from "@/lib/simulate";
import { dueServices, log, recordSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The scheduled run. Vercel Cron calls this once a day (see vercel.json) and
 * every service whose interval has elapsed gets checked without anyone opening
 * the site. A backup that depends on someone remembering is not a backup.
 *
 * Set CRON_SECRET in the project and Vercel signs the call, so the endpoint
 * cannot be triggered by anyone who finds the URL.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Not authorised." }, { status: 401 });
    }
  }

  const due = dueServices();
  const ran: { id: string; name: string; verdict: string; exitCost: number; sentence: string }[] = [];

  for (const service of due) {
    const snapshot = buildSnapshot(service);
    recordSnapshot(service.id, snapshot);
    ran.push({
      id: service.id,
      name: service.name,
      verdict: snapshot.verdict,
      exitCost: snapshot.exitCost,
      sentence: exitCost(service).sentence,
    });
  }

  if (due.length === 0) log("Scheduled run: nothing was due.");

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    checked: ran.length,
    ran,
    // A check that passes is not news. Only these are worth sending to a person.
    worthTelling: ran.filter((r) => r.verdict !== "readable").map((r) => ({ id: r.id, sentence: r.sentence })),
  });
}
