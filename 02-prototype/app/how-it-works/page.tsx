export const metadata = { title: "How Exit Check works" };

export default function HowItWorks() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">How it works</p>
        <h1>Four steps, and the third one is the product</h1>
        <p className="lede">
          Most backup tools stop after step two. A file that downloaded is not the same as a file
          that opens, and neither one tells you what leaving would cost.
        </p>
      </header>

      <div className="stack">
        <section className="card">
          <h2>1. Run the platform&rsquo;s own export, on a schedule</h2>
          <p className="small" style={{ color: "var(--ink-soft)" }}>
            Exit Check does not invent a way out. It uses the export the platform already publishes,
            and runs it every day, week or month without anyone remembering to. Where the export is
            an API it runs unattended. Where it is a button in an interface, that friction is
            recorded and counted against the score, because an export nobody performs is not one you
            have.
          </p>
        </section>

        <section className="card">
          <h2>2. Write the copy where you control it</h2>
          <p className="small" style={{ color: "var(--ink-soft)" }}>
            A folder on your own disk, your own object storage, your own NAS. Exit Check never holds
            the only copy of anything, which is the mistake the product exists to argue against.
            Replacing one dependency with another is not an exit.
          </p>
        </section>

        <section className="card" style={{ borderColor: "var(--exit)" }}>
          <h2>3. Open it, and say what is missing</h2>
          <p className="small" style={{ color: "var(--ink-soft)" }}>
            Every JSON, CSV, XML and ENEX file is parsed. Images are checked against their magic
            bytes. Zero byte files, nested archives, duplicated paths, metadata stranded in sidecar
            files and paths that will not restore are all reported by name. Then the copy is
            compared against the platform, item type by item type, and whatever the export left
            behind is written down in plain language.
          </p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            This is the step you can try right now on the Check an export page, with a real archive
            or with the sample.
          </p>
        </section>

        <section className="card">
          <h2>4. Answer one question, in one sentence</h2>
          <p className="small" style={{ color: "var(--ink-soft)" }}>
            Leaving this service today would take about N hours and $N, and you would leave behind
            these things. That sentence is the entire output. Everything else on this site exists to
            make it defensible.
          </p>
        </section>

        <section className="card">
          <h2>What it deliberately is not</h2>
          <ul className="small" style={{ color: "var(--ink-soft)", paddingLeft: 18 }}>
            <li>
              <strong>Not a model.</strong> The exit cost is arithmetic over fields you can read. A
              number you cannot argue with is a number you cannot trust.
            </li>
            <li>
              <strong>Not a migration tool.</strong> Moving your data is a different product with a
              different failure mode. This one only measures.
            </li>
            <li>
              <strong>Not another place your data lives.</strong> The copy goes to storage you own.
              The export you check on this site is read in your browser and never uploaded.
            </li>
            <li>
              <strong>Not a dashboard to visit.</strong> It should be silent until a number moves,
              and then it should send one sentence.
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>What is real in this prototype, and what is not</h2>
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>State</th>
                <th>Where it lives</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Export archive inspection</td>
                <td><span className="badge portable">Real</span></td>
                <td className="mono">lib/read-archive.ts, lib/inspect.ts</td>
              </tr>
              <tr>
                <td>Exit cost scoring</td>
                <td><span className="badge portable">Real</span></td>
                <td className="mono">lib/score.ts</td>
              </tr>
              <tr>
                <td>Scheduled runs</td>
                <td><span className="badge portable">Real</span></td>
                <td className="mono">app/api/cron, vercel.json</td>
              </tr>
              <tr>
                <td>Platform connectors and transfer</td>
                <td><span className="badge sticky">Simulated</span></td>
                <td className="mono">lib/simulate.ts</td>
              </tr>
              <tr>
                <td>Portfolio contents</td>
                <td><span className="badge sticky">Demo data</span></td>
                <td className="mono">lib/seed.ts</td>
              </tr>
              <tr>
                <td>Storage of state</td>
                <td><span className="badge sticky">In memory</span></td>
                <td className="mono">lib/store.ts</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
