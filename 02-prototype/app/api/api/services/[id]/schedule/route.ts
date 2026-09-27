import { NextResponse } from "next/server";
import { setSchedule } from "@/lib/store";
import type { Schedule } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: Schedule[] = ["daily", "weekly", "monthly", "off"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { schedule?: Schedule };

  if (!body.schedule || !ALLOWED.includes(body.schedule)) {
    return NextResponse.json(
      { error: `Schedule must be one of ${ALLOWED.join(", ")}.` },
      { status: 400 }
    );
  }

  const service = setSchedule(id, body.schedule);
  if (!service) return NextResponse.json({ error: "No such service." }, { status: 404 });

  return NextResponse.json({ service });
}
