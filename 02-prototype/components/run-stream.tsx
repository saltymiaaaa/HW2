"use client";

import { useEffect, useRef, useState } from "react";
import { STATIC_MODE } from "@/lib/client-data";
import { planRun } from "@/lib/simulate";
import { useI18n } from "@/components/i18n";
import type { Service } from "@/lib/types";

type Step = { key: string; label: string; detail: string };
type Finding = { step: string; level: "ok" | "warn" | "fail"; text: string };

/**
 * Shows a check run step by step. On a server deployment the steps arrive as
 * an event stream from /api/services/[id]/run. On a static deployment the same
 * plan runs locally with the same timings, so the demo behaves identically.
 */
export default function RunStream({
  service,
  onDone,
}: {
  service: Service;
  onDone: () => void;
}) {
  const { lang } = useI18n();
  const [steps, setSteps] = useState<Step[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    if (STATIC_MODE) {
      const plan = planRun(service);
      setSteps(plan.map(({ key, label, detail }) => ({ key, label, detail })));
      (async () => {
        for (const step of plan) {
          if (cancelled) return;
          setCurrent(step.key);
          await new Promise((r) => setTimeout(r, step.ms));
          if (cancelled) return;
          setDone((d) => [...d, step.key]);
          setFindings((f) => [
            ...f,
            ...step.findings.map((x) => ({ step: step.key, level: x.level, text: x.text })),
          ]);
        }
        setCurrent(null);
        setTimeout(onDone, 900);
      })();
      return () => {
        cancelled = true;
      };
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/services/${service.id}/run`, {
          method: "POST",
          signal: controller.signal,
        });
        if (!response.body) throw new Error("No stream was returned.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done: finished, value } = await reader.read();
          if (finished) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const eventLine = frame.split("\n").find((l) => l.startsWith("event: "));
            const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!eventLine || !dataLine) continue;
            const event = eventLine.slice(7).trim();
            const data = JSON.parse(dataLine.slice(6));

            if (event === "plan") setSteps(data.steps);
            if (event === "step_start") setCurrent(data.key);
            if (event === "step_done") setDone((d) => [...d, data.key]);
            if (event === "finding") setFindings((f) => [...f, data]);
            if (event === "error") setFailed(data.message);
            if (event === "complete") setCurrent(null);
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setFailed((e as Error).message);
      } finally {
        setTimeout(onDone, 900);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.id]);

  return (
    <section className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ marginBottom: 4 }}>{service.name}</h2>
      <p className="small muted" style={{ marginBottom: 14 }}>
        {lang === "en"
          ? "Every step below is work the product does on your behalf. The transfer is simulated in this prototype. The reasoning is not."
          : lang === "zh"
            ? "下面的每一步都是产品替你完成的工作。原型中的传输是模拟的，但推理是真实的。"
            : "Mỗi bước dưới đây là việc sản phẩm làm thay bạn. Phần truyền dữ liệu trong bản prototype là mô phỏng, phần phân tích thì không."}
      </p>

      {failed ? <p className="note">The run stopped: {failed}</p> : null}

      {steps.length === 0 ? <p className="muted small">Starting.</p> : null}

      {steps.map((step) => {
        const isDone = done.includes(step.key);
        const isRunning = current === step.key;
        const stepFindings = findings.filter((f) => f.step === step.key);
        return (
          <div key={step.key} className={`step ${isDone ? "done" : isRunning ? "running" : ""}`}>
            <span className="step-mark">{isDone ? "✓" : ""}</span>
            <div>
              <div className="step-label">{step.label}</div>
              <div className="step-detail">{step.detail}</div>
              {stepFindings.length > 0 ? (
                <div className="step-findings">
                  {stepFindings.map((f, i) => (
                    <div className="step-finding" key={i}>
                      <span className={`dot ${f.level}`} style={{ marginTop: 6 }} />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
