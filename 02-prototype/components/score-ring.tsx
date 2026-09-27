import type { ExitCost } from "@/lib/types";

const COLOR: Record<ExitCost["band"], string> = {
  portable: "var(--portable)",
  sticky: "var(--sticky)",
  trapped: "var(--trapped)",
};

/**
 * Exit cost as a ring. The number is the message, so the ring stays quiet:
 * one arc, no gradient, no needle.
 */
export default function ScoreRing({
  score,
  band,
  size = 92,
  label,
}: {
  score: number;
  band: ExitCost["band"];
  size?: number;
  label?: string;
}) {
  const stroke = size < 70 ? 6 : 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * c;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={`Exit cost ${score} out of 100`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="color-mix(in srgb, currentColor 12%, transparent)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={COLOR[band]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c - filled}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--mono)",
            fontWeight: 600,
            fontSize: size * 0.3,
            letterSpacing: "-0.04em",
          }}
        >
          {score}
        </div>
      </div>
      {label ? <span className="small muted">{label}</span> : null}
    </div>
  );
}
