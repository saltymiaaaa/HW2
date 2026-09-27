import Link from "next/link";
import Logo from "@/components/logo";
import ScoreRing from "@/components/score-ring";

export const metadata = {
  title: "Exit Check",
  description:
    "Know what leaving a service would cost, before the day you have to leave. Exit Check keeps a verified copy of your data outside every platform you depend on.",
};

/**
 * The landing page. It has one job: somebody who has never seen this should
 * understand what it is, what it produces and where to click, without reading
 * any documentation.
 */
export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
       <div className="hero-copy">
        <div className="hero-mark">
          <Logo size={40} />
          <span className="brand-sub">Know the cost of leaving</span>
        </div>

        <h1>
          You find out what leaving a service costs on the <em>worst possible day</em>.
        </h1>

        <p className="lede" style={{ maxWidth: "62ch", fontSize: "1.12rem" }}>
          The day the price changes, the free tier shrinks, or the company is acquired. Exit Check
          answers the question in advance. It keeps a copy of your data outside every platform you
          depend on, opens that copy to prove it is readable, and reports what did not come out.
        </p>

        <div className="specimen">
          <p className="eyebrow" style={{ marginBottom: 10 }}>The entire output of the product</p>
          <p className="verdict-sentence is-sticky" style={{ fontSize: "1.35rem" }}>
            Leaving Notion today would take about 34 hours and no direct spend, and you would leave
            behind databases, database relations, comments, sharing and permissions and page
            history.
          </p>
        </div>

        <div className="row" style={{ marginTop: 26, gap: 10 }}>
          <Link className="button button-primary" href="/portfolio">
            Open the demo portfolio
          </Link>
          <Link className="button" href="/verify">
            Check a real export
          </Link>
          <Link className="button" href="#how-to-use" style={{ border: "none" }}>
            How do I use this?
          </Link>
        </div>
       </div>

        <aside className="hero-panel">
          <p className="eyebrow" style={{ marginBottom: 12 }}>A card from the portfolio</p>
          <div className="card">
            <div className="spread">
              <div>
                <h3 style={{ marginBottom: 2 }}>Notion</h3>
                <p className="small muted" style={{ margin: 0 }}>Documents and databases</p>
              </div>
              <ScoreRing score={64} band="trapped" size={64} />
            </div>

            <div className="row" style={{ marginTop: 14, marginBottom: 14 }}>
              <span className="badge trapped">Trapped</span>
              <span className="badge sticky">Lossy</span>
            </div>

            <dl className="kv" style={{ rowGap: 10 }}>
              <dt>Comments</dt>
              <dd>
                <span className="badge trapped">Stays behind</span>
              </dd>
              <dt>Page history</dt>
              <dd>
                <span className="badge trapped">Stays behind</span>
              </dd>
              <dt>Databases</dt>
              <dd>
                <span className="badge sticky">Comes out reduced</span>
              </dd>
              <dt>Pages</dt>
              <dd>
                <span className="badge portable">Comes out in full</span>
              </dd>
            </dl>
          </div>

          <p className="small muted" style={{ marginTop: 10 }}>
            Four of the seven item types in a Notion workspace do not survive its own export. That is
            the difference between having a copy and being able to leave.
          </p>
        </aside>
      </section>

      <section className="band">
        <h2 style={{ marginBottom: 6 }}>The problem is not backup</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 20 }}>
          Most people already hold a copy of something. What they do not hold is an answer. Three
          things go wrong quietly, and they fail in different ways.
        </p>

        <div className="grid grid-3">
          <article className="card">
            <p className="num-mark">01</p>
            <h3>The export runs once</h3>
            <p className="small" style={{ color: "var(--ink-soft)", marginBottom: 0 }}>
              Then never again, so the copy slowly describes a version of your work that no longer
              exists. Nobody remembers to repeat a task that has no deadline.
            </p>
          </article>
          <article className="card">
            <p className="num-mark">02</p>
            <h3>Nobody opens it</h3>
            <p className="small" style={{ color: "var(--ink-soft)", marginBottom: 0 }}>
              A truncated archive and a complete one look identical in a folder. You discover the
              difference on the day you try to use it, which is the worst day to discover it.
            </p>
          </article>
          <article className="card">
            <p className="num-mark">03</p>
            <h3>The export leaves things out</h3>
            <p className="small" style={{ color: "var(--ink-soft)", marginBottom: 0 }}>
              By design. Comments, version history, permissions and the relationships between
              records are usually in no export format at all, and nothing tells you.
            </p>
          </article>
        </div>
      </section>

      <section className="band">
        <h2 style={{ marginBottom: 6 }}>Four steps, and the third one is the product</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 22 }}>
          Most tools in this area stop after step two.
        </p>

        <ol className="steps">
          <li>
            <h3>Run the platform&rsquo;s own export, on a schedule</h3>
            <p>
              No new way out is invented. The export the platform already publishes is run every
              day, week or month, so the copy does not depend on anyone remembering.
            </p>
          </li>
          <li>
            <h3>Write the copy where you control it</h3>
            <p>
              Your disk, your storage. Exit Check never holds the only copy of anything, because
              replacing one dependency with another is not an exit.
            </p>
          </li>
          <li className="is-key">
            <h3>Open it, and say what is missing</h3>
            <p>
              Every structured file is parsed rather than counted. Images are checked against their
              real bytes. Then the copy is compared with the platform, one item type at a time.
            </p>
          </li>
          <li>
            <h3>Answer one question, in one sentence</h3>
            <p>How many hours, how much money, and exactly what would be left behind.</p>
          </li>
        </ol>
      </section>

      <section className="band" id="how-to-use">
        <p className="eyebrow">Start here</p>
        <h2 style={{ marginBottom: 6 }}>How to use this in three minutes</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 22 }}>
          Nothing needs to be installed, connected or signed into. Do these in order.
        </p>

        <div className="grid grid-3">
          <article className="card howto">
            <p className="num-mark">1</p>
            <h3>Look at a portfolio</h3>
            <p className="small">
              Six platforms, each with a score from 0 to 100 and a sentence saying what leaving
              would cost. Green means you could walk out this week. Red means some of it is never
              coming back.
            </p>
            <Link className="button" href="/portfolio">
              Open the portfolio
            </Link>
          </article>

          <article className="card howto">
            <p className="num-mark">2</p>
            <h3>Open one, and run a check</h3>
            <p className="small">
              Press <strong>Check this service now</strong>. The run streams live, step by step, and
              finishes by naming what the export leaves behind. Every factor in the score shows the
              evidence it came from.
            </p>
            <Link className="button" href="/services/notion">
              Open Notion
            </Link>
          </article>

          <article className="card howto">
            <p className="num-mark">3</p>
            <h3>Check a real archive</h3>
            <p className="small">
              This part is not a demo. Press <strong>Try it with a sample export</strong>, or drop in
              a genuine export you already have. The archive is opened in your browser and never
              uploaded.
            </p>
            <Link className="button button-primary" href="/verify">
              Check an export
            </Link>
          </article>
        </div>

        <p className="note" style={{ marginTop: 18 }}>
          The portfolio is demo data, and it is labelled as such everywhere it appears. The export
          checker is real code doing real work on a real file. If you only have time for one thing,
          make it step three.
        </p>
      </section>

      <section className="band">
        <h2 style={{ marginBottom: 6 }}>What the score means</h2>
        <p className="lede" style={{ marginTop: 0, marginBottom: 20 }}>
          Exit cost runs from 0 to 100. Zero means you could leave today. One hundred means the data
          is effectively hostage.
        </p>

        <div className="grid grid-3">
          <article className="card">
            <span className="badge portable">Portable, under 30</span>
            <p className="small" style={{ marginTop: 12, marginBottom: 0, color: "var(--ink-soft)" }}>
              The export is complete, it opens in other tools, and being operational elsewhere is a
              short job. GitHub scores 26.
            </p>
          </article>
          <article className="card">
            <span className="badge sticky">Sticky, 30 to 54</span>
            <p className="small" style={{ marginTop: 12, marginBottom: 0, color: "var(--ink-soft)" }}>
              You can leave, and it will cost you real days, or land you in a format only one
              company opens. Figma scores 46.
            </p>
          </article>
          <article className="card">
            <span className="badge trapped">Trapped, 55 and above</span>
            <p className="small" style={{ marginTop: 12, marginBottom: 0, color: "var(--ink-soft)" }}>
              Something important does not come out at all. Notion scores 64, and Slack is counted
              as trapped at 53 by a rule that overrides the arithmetic.
            </p>
          </article>
        </div>

        <p className="small muted" style={{ marginTop: 16, maxWidth: "80ch" }}>
          Six weighted factors, each read from a field you can inspect, and no model anywhere. One
          rule beats the arithmetic: if more than a quarter of what you hold cannot be exported at
          all, the service is trapped whatever the score says, because moving quickly does not help
          with data that never comes out.
        </p>
      </section>

      <section className="band">
        <h2 style={{ marginBottom: 14 }}>Questions people ask first</h2>
        <div className="faq">
          <details>
            <summary>Is this a backup tool?</summary>
            <p>
              No. A backup tool gets you a copy. This tells you whether the copy is worth anything
              and what it would still cost you to leave. The verification and the number are the
              product; the copy is the means.
            </p>
          </details>
          <details>
            <summary>Does my data get uploaded anywhere?</summary>
            <p>
              No. On the Check an export page the archive is opened inside your browser. Only the
              manifest, which is file names, sizes and parse results, is sent to the server so it
              can be scored. In the full product the copy is written to storage you already control,
              and Exit Check never holds the only copy of anything.
            </p>
          </details>
          <details>
            <summary>Is any of this AI?</summary>
            <p>
              No, and that is deliberate. The exit cost is arithmetic over fields you can read, and
              the archive checker is parsers. The whole claim is that a number can be trusted, so
              the number has to be one you can take apart and disagree with.
            </p>
          </details>
          <details>
            <summary>What is real in this prototype?</summary>
            <p>
              The archive checker, the scoring, the scheduled runs and the live event stream are
              real. The platform connectors that would perform the transfer are simulated, and the
              portfolio is demo data built from each platform&rsquo;s published export behaviour.
              The <Link href="/how-it-works">How it works</Link> page has the full table.
            </p>
          </details>
          <details>
            <summary>Who is it for?</summary>
            <p>
              Individuals and small teams holding years of work inside subscription tools. Not
              enterprises, who have procurement, retention obligations and their own exit clauses.
              The value here is for people whose leverage over a platform is zero.
            </p>
          </details>
        </div>
      </section>

      <section className="band closing">
        <h2 style={{ fontSize: "clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem)", maxWidth: "26ch" }}>
          Every service you rely on is trusted with something irreplaceable, and not one of them
          publishes what leaving would cost.
        </h2>
        <div className="row" style={{ marginTop: 22 }}>
          <Link className="button button-primary" href="/verify">
            Check an export now
          </Link>
          <Link className="button" href="/portfolio">
            See the demo portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}
