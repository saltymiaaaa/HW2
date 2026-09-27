/**
 * The mark: a container with an opening on the right and something leaving
 * through it, checked. The whole product in one glyph.
 */
export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Exit Check"
    >
      <rect
        x="3.25"
        y="3.25"
        width="25.5"
        height="25.5"
        rx="7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray="34 12"
        strokeDashoffset="-38"
        opacity="0.45"
      />
      <path
        d="M11 16.6 14.6 20.2 22 12"
        stroke="var(--exit)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.4 12h2.2v2.2"
        stroke="var(--exit)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0"
      />
    </svg>
  );
}
