import { NextResponse } from "next/server";
import { exitCost } from "@/lib/score";
import { getService, removeService } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const service = getService(id);
  if (!service) return NextResponse.json({ error: "No such service." }, { status: 404 });
  return NextResponse.json({ service, cost: exitCost(service) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = removeService(id);
  if (!ok) return NextResponse.json({ error: "No such service." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
