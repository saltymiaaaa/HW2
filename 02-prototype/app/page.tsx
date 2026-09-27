"use client";

import Link from "next/link";
import ScoreRing from "@/components/score-ring";
import { useI18n } from "@/components/i18n";

/* Demo scores, matching the latest runs in lib/seed.ts. */
const PLATFORMS = [
  { name: "Notion", score: 62, band: "trapped" },
  { name: "Evernote", score: 51, band: "sticky" },
  { name: "Slack", score: 51, band: "sticky" },
  { name: "Figma", score: 44, band: "sticky" },
  { name: "Google Photos", score: 29, band: "portable" },
  { name: "GitHub", score: 25, band: "portable" },
] as const;

function bandColor(band: string) {
  return `var(--${band})`;
}

/* Minimal inline icons, one per pain point. */
const PainIcons = [
  // clock-once: a clock with a single tick
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>,
  // unopened box
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8" /><path d="M3.3 7l8 4.6a2 2 0 0 0 1.4 0L21 7" /><path d="M12 22V12" />
  </svg>,
  // data leaking out of a jar
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="6.5" r="2.5" />
  </svg>,
];

/* Icons for the four flow steps. */
const FlowIcons = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z" /><path d="M3.3 7l8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.7 9a.6.6 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.6 3.8 17 5 19 5a1 1 0 0 1 1 1Z" /><path d="m9 12 2 2 4-4" />
  </svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" />
  </svg>,
];

export default function Landing() {
  const { t } = useI18n();

  return (
    <div className="landing">
      {/* --- introduction: what this is and what problem it solves --- */}
      <section className="intro-band">
        <p className="eyebrow">{t.intro.eyebrow}</p>
        <p className="intro-what">{t.intro.what}</p>
        <div className="grid grid-3">
          {t.intro.cards.map((c) => (
            <div className="card intro-card" key={c.k}>
              <h3>{c.k}</h3>
              <p>{c.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-pill">
            <span className="pulse-dot" /> {t.hero.pill}
          </span>

          <h1>
            {t.hero.h1a}
            <em>{t.hero.h1b}</em>
          </h1>

          <p className="lede">{t.hero.lede}</p>

          <div className="stat-strip">
            <div className="stat">
              <span className="stat-value">6</span>
              <span className="stat-label">{t.hero.s1}</span>
            </div>
            <div className="stat">
              <span className="stat-value">0–100</span>
              <span className="stat-label">{t.hero.s2}</span>
            </div>
            <div className="stat">
              <span className="stat-value">0</span>
              <span className="stat-label">{t.hero.s3}</span>
            </div>
          </div>

          <div className="row" style={{ marginTop: 26 }}>
            <Link className="button button-primary" href="/portfolio">
              {t.hero.cta}
            </Link>
            <Link className="button" href="/verify">
              {t.hero.cta2}
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <div className="card">
            <div className="spread">
              <div>
                <h3 style={{ marginBottom: 2 }}>Notion</h3>
                <span className="badge trapped">{t.chart.verdict}</span>
              </div>
              <ScoreRing score={64} band="trapped" size={64} />
            </div>
            <div className="chip-row" style={{ marginTop: 14 }}>
              <span className="mini-chip">⏱ {t.chart.hours}</span>
              <span className="mini-chip is-bad">⚠ {t.chart.behind}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* --- bar chart: the whole portfolio at a glance --- */}
      <section className="band">
        <p className="eyebrow">Portfolio</p>
        <h2 style={{ marginBottom: 4 }}>{t.chart.title}</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 20 }}>
          {t.chart.sub}
        </p>

        <div className="card chart">
          {PLATFORMS.map((p) => (
            <Link href="/portfolio" key={p.name} className="chart-row">
              <span className="chart-name">{p.name}</span>
              <span className="chart-bar">
                <span style={{ width: `${p.score}%`, background: bandColor(p.band) }} />
              </span>
              <span className="chart-val">{p.score}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* --- pain points: icon cards, one line each --- */}
      <section className="band">
        <p className="eyebrow">Sound familiar?</p>
        <h2 style={{ marginBottom: 4 }}>{t.pains.title}</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 20 }}>
          {t.pains.sub}
        </p>

        <div className="grid grid-3">
          {t.pains.items.map((item, i) => (
            <article className="card icon-card" key={item.t}>
              <span className="icon-circle">{PainIcons[i]}</span>
              <h3>{item.t}</h3>
              <p className="small" style={{ color: "var(--ink-soft)", margin: 0 }}>
                {item.d}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* --- 0-100 scale --- */}
      <section className="band">
        <h2 style={{ marginBottom: 20 }}>{t.scale.title}</h2>
        <div className="card scale-card">
          <div className="scale-bar">
            <span className="seg seg-portable" />
            <span className="seg seg-sticky" />
            <span className="seg seg-trapped" />
          </div>
          <div className="scale-marks">
            <div className="mark">
              <span className="badge portable">{t.scale.portable}</span>
              <span className="small muted">{t.scale.p1}</span>
            </div>
            <div className="mark">
              <span className="badge sticky">{t.scale.sticky}</span>
              <span className="small muted">{t.scale.p2}</span>
            </div>
            <div className="mark">
              <span className="badge trapped">{t.scale.trapped}</span>
              <span className="small muted">{t.scale.p3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- how it works: icon flow --- */}
      <section className="band">
        <p className="eyebrow">How it works</p>
        <h2 style={{ marginBottom: 4 }}>{t.flow.title}</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 22 }}>
          {t.flow.sub}
        </p>

        <div className="flow">
          {t.flow.steps.map((s, i) => (
            <div className={`flow-step${i === 2 ? " is-key" : ""}`} key={s.t}>
              <span className="icon-circle">{FlowIcons[i]}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- three-minute tour --- */}
      <section className="band" id="how-to-use">
        <p className="eyebrow">Start here</p>
        <h2 style={{ marginBottom: 20 }}>{t.howto.title}</h2>

        <div className="grid grid-3">
          <article className="card howto">
            <p className="num-mark">1</p>
            <h3>{t.howto.items[0].t}</h3>
            <Link className="button" href="/portfolio">{t.howto.items[0].cta}</Link>
          </article>
          <article className="card howto">
            <p className="num-mark">2</p>
            <h3>{t.howto.items[1].t}</h3>
            <Link className="button" href="/services/notion">{t.howto.items[1].cta}</Link>
          </article>
          <article className="card howto">
            <p className="num-mark">3</p>
            <h3>{t.howto.items[2].t}</h3>
            <Link className="button button-primary" href="/verify">{t.howto.items[2].cta}</Link>
          </article>
        </div>
      </section>

      {/* --- FAQ, one-line answers --- */}
      <section className="band">
        <h2 style={{ marginBottom: 14 }}>{t.faq.title}</h2>
        <div className="faq">
          {t.faq.items.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="band closing">
        <h2 style={{ fontSize: "clamp(1.6rem, 1.2rem + 1.8vw, 2.3rem)", marginBottom: 10 }}>
          {t.closing.h}
        </h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 24 }}>
          {t.closing.sub}
        </p>
        <div className="row">
          <Link className="button" href="/verify">{t.closing.cta}</Link>
          <Link className="button" href="/portfolio">{t.closing.cta2}</Link>
        </div>
      </section>
    </div>
  );
}
