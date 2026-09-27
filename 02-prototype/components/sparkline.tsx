import type { PricePoint } from "@/lib/types";

/**
 * Price over time. Steps rather than a smooth line, because a subscription
 * price does not drift, it jumps on a date someone chose.
 */
export default function Sparkline({ points }: { points: PricePoint[] }) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return <p className="small muted">No price history recorded.</p>;

  const width = 320;
  const height = 74;
  const pad = 6;

  const first = Date.parse(sorted[0].date);
  const last = Math.max(Date.parse(sorted[sorted.length - 1].date), first + 1);
  const max = Math.max(...sorted.map((p) => p.usd), 1);

  const x = (d: string) => pad + ((Date.parse(d) - first) / (last - first)) * (width - pad * 2);
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);

  let path = `M ${x(sorted[0].date)} ${y(sorted[0].usd)}`;
  for (let i = 1; i < sorted.length; i += 1) {
    path += ` L ${x(sorted[i].date)} ${y(sorted[i - 1].usd)} L ${x(sorted[i].date)} ${y(sorted[i].usd)}`;
  }
  path += ` L ${width - pad} ${y(sorted[sorted.length - 1].usd)}`;

  const rise = sorted[sorted.length - 1].usd - sorted[0].usd;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`Price moved from $${sorted[0].usd} to $${sorted[sorted.length - 1].usd}`}
      >
        <path
          d={path}
          fill="none"
          stroke={rise > 0 ? "var(--sticky)" : "var(--portable)"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {sorted.map((p) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.usd)} r="2.6" fill={rise > 0 ? "var(--sticky)" : "var(--portable)"} />
        ))}
      </svg>
      <div className="spread small muted">
        <span>
          ${sorted[0].usd.toFixed(2)} in {sorted[0].date.slice(0, 4)}
        </span>
        <span>
          ${sorted[sorted.length - 1].usd.toFixed(2)} now
          {rise > 0 ? `, up ${Math.round((rise / Math.max(sorted[0].usd, 0.01)) * 100)}%` : ""}
        </span>
      </div>
    </div>
  );
}
