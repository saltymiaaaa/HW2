import { exitCost } from "@/lib/score";
import { buildSnapshot, planRun } from "@/lib/simulate";
import { getService, recordSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";
/** Node runtime, because a real connector would need filesystem and network access. */
export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/**
 * Runs a check and streams it as server sent events, so the interface can show
 * the work instead of a progress bar that means nothing.
 *
 * Event names: step_start, finding, step_done, complete, error.
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const service = getService(id);

  if (!service) {
    return new Response(JSON.stringify({ error: "No such service." }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const steps = planRun(service);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      try {
        send("plan", { steps: steps.map((s) => ({ key: s.key, label: s.label, detail: s.detail })) });

        for (const step of steps) {
          send("step_start", { key: step.key, label: step.label, detail: step.detail });
          // The demo compresses real durations. The order of work is unchanged.
          await wait(Math.min(step.ms, 2600) / 2);
          for (const finding of step.findings) {
            send("finding", { step: step.key, ...finding });
            await wait(90);
          }
          send("step_done", { key: step.key });
        }

        const snapshot = buildSnapshot(service);
        recordSnapshot(service.id, snapshot);
        send("complete", { snapshot, cost: exitCost(service) });
      } catch (error) {
        send("error", { message: (error as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
