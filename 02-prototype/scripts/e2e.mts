/**
 * End to end scenarios, run against a live server.
 *
 *   npm run build && npm start -- -p 3400     (in one terminal)
 *   npm run test:e2e                          (in another)
 *
 * Override the target with BASE_URL. Every scenario is written as a user
 * journey rather than a unit, because the thing worth protecting here is that
 * the four screens still tell the truth together.
 */

import { buildSampleExport } from "../lib/sample-export";
import { readArchive } from "../lib/read-archive";
import { inspectManifest } from "../lib/inspect";
import { exitCost, portfolio } from "../lib/score";
import { seedServices } from "../lib/seed";
import type { Manifest } from "../lib/types";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3400";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` :: ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` :: ${detail}` : ""}`);
  }
}

function scenario(name: string) {
  console.log(`\n${name}`);
}

async function json(path: string, init?: RequestInit) {
  const response = await fetch(BASE + path, init);
  const body = await response.json().catch(() => null);
  return { status: response.status, body } as { status: number; body: any };
}

async function html(path: string) {
  const response = await fetch(BASE + path);
  return { status: response.status, text: await response.text() };
}

/** Reads the whole server sent event stream and returns the events in order. */
async function readEvents(path: string): Promise<{ event: string; data: any }[]> {
  const response = await fetch(BASE + path, { method: "POST" });
  if (!response.body) throw new Error("no stream");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events: { event: string; data: any }[] = [];
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const lines = frame.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event: "));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      if (!eventLine || !dataLine) continue;
      events.push({ event: eventLine.slice(7).trim(), data: JSON.parse(dataLine.slice(6)) });
    }
  }
  return events;
}

async function main() {
  console.log(`Exit Check end to end scenarios against ${BASE}\n${"=".repeat(60)}`);

  // --------------------------------------------------------------------
  scenario("Scenario 1. Somebody who has never seen this arrives at the landing page");
  {
    const page = await html("/");
    check("landing page responds", page.status === 200, `status ${page.status}`);
    check(
      "it says what the product produces",
      page.text.includes("Leaving Notion today would take about 34 hours")
    );
    check("it links to the portfolio", page.text.includes('href="/portfolio"'));
    check("it links to the export checker", page.text.includes('href="/verify"'));
    check("it has a how to use section", page.text.includes("how-to-use"));
    check("it explains the bands", page.text.includes("Portable, under 30"));
    check("it answers whether data is uploaded", page.text.toLowerCase().includes("uploaded"));
  }

  // --------------------------------------------------------------------
  scenario("Scenario 2. They open the portfolio and read the summary");
  {
    const page = await html("/portfolio");
    check("portfolio page responds", page.status === 200, `status ${page.status}`);
    check("it is labelled as demo data", page.text.includes("Demo data"));

    const { status, body } = await json("/api/services");
    check("the services API responds", status === 200);
    check("six services are present", body?.services?.length === 6, `got ${body?.services?.length}`);

    const allSound = (body.services as any[]).every(
      (row) =>
        typeof row.cost.score === "number" &&
        row.cost.score >= 0 &&
        row.cost.score <= 100 &&
        ["portable", "sticky", "trapped"].includes(row.cost.band) &&
        row.cost.sentence.startsWith("Leaving ") &&
        row.cost.sentence.endsWith(".")
    );
    check("every service has a score in range and a finished sentence", allSound);

    const bands = new Set((body.services as any[]).map((r) => r.cost.band));
    check("the scores actually discriminate", bands.size >= 3, `bands seen: ${[...bands].join(", ")}`);
  }

  // --------------------------------------------------------------------
  scenario("Scenario 3. They open one service and run a check");
  {
    const before = await json("/api/services/notion");
    check("the service detail responds", before.status === 200);
    const snapshotsBefore = before.body.service.snapshots.length;

    const events = await readEvents("/api/services/notion/run");
    const names = events.map((e) => e.event);

    check("the run streams a plan first", names[0] === "plan", `first event ${names[0]}`);
    check("every planned step starts", names.filter((n) => n === "step_start").length === 7);
    check("every started step finishes", names.filter((n) => n === "step_done").length === 7);
    check("findings are emitted", names.filter((n) => n === "finding").length > 5);
    check("the run completes", names[names.length - 1] === "complete");
    check("no error event", !names.includes("error"));

    const complete = events[events.length - 1].data;
    check("the snapshot carries a verdict", ["readable", "lossy", "unreadable"].includes(complete.snapshot.verdict));
    check(
      "the completed cost matches the scored cost",
      complete.cost.score === complete.snapshot.exitCost,
      `${complete.cost.score} vs ${complete.snapshot.exitCost}`
    );

    const after = await json("/api/services/notion");
    check(
      "the snapshot was recorded",
      after.body.service.snapshots.length === snapshotsBefore + 1,
      `${snapshotsBefore} then ${after.body.service.snapshots.length}`
    );
    check(
      "the findings name what the export leaves behind",
      events.some((e) => e.event === "finding" && /comments/i.test(e.data.text))
    );
  }

  // --------------------------------------------------------------------
  scenario("Scenario 4. They change how often a service is checked");
  {
    const set = await json("/api/services/figma/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ schedule: "daily" }),
    });
    check("the schedule is accepted", set.status === 200);
    check("the change is returned", set.body.service.schedule === "daily");

    const read = await json("/api/services/figma");
    check("the change persisted", read.body.service.schedule === "daily");

    const bad = await json("/api/services/figma/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ schedule: "hourly" }),
    });
    check("an unsupported interval is rejected", bad.status === 400, `status ${bad.status}`);
    check("the rejection says what is allowed", /daily/.test(bad.body.error ?? ""));
  }

  // --------------------------------------------------------------------
  scenario("Scenario 5. They check a real archive on the verify page");
  {
    const file = new File([buildSampleExport()], "sample-export.zip", { type: "application/zip" });
    const manifest = await readArchive(file);
    check("the archive opened in the browser path", manifest.entries.length > 10);
    check("nothing was truncated at this size", manifest.truncated === false);

    const { status, body } = await json("/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(manifest),
    });
    check("the verify API responds", status === 200);

    const inspection = body.inspection;
    check("the verdict is not a pass", inspection.verdict === "lossy", `got ${inspection.verdict}`);

    const titles = inspection.findings.map((f: any) => f.title).join(" | ");
    check("broken files are found", /not readable/.test(titles), titles);
    check("the zero byte file is found", /zero bytes/.test(titles), titles);
    check("the closed format is found", /closed format/.test(titles), titles);
    check("the nested archive is found", /inside this archive/.test(titles), titles);
    check("the sidecar files are found", /sidecar/.test(titles), titles);
    check("the unrestorable path is found", /will not restore/.test(titles), titles);

    check(
      "the response does not echo the file list back",
      Array.isArray(body.manifest.entries) && body.manifest.entries.length === 0
    );
  }

  // --------------------------------------------------------------------
  scenario("Scenario 6. The verify endpoint is given rubbish");
  {
    const notJson = await fetch(BASE + "/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "this is not json",
    });
    check("a body that is not JSON is rejected", notJson.status === 400, `status ${notJson.status}`);

    const noEntries = await json("/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceName: "x.zip" }),
    });
    check("a manifest with no entries is rejected", noEntries.status === 400);

    const empty = await json("/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceName: "empty.zip", sourceSize: 0, kind: "zip", truncated: false, entries: [] }),
    });
    check("an empty archive is accepted and judged unknown", empty.status === 200 && empty.body.inspection.verdict === "unknown");
    check(
      "and it says so in plain language",
      /nothing readable/i.test(empty.body.inspection.sentence),
      empty.body.inspection.sentence
    );
  }

  // --------------------------------------------------------------------
  scenario("Scenario 7. They add a service of their own, then remove it");
  {
    const created = await json("/api/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test Notes App", monthlyUsd: 5, exportMethod: "none" }),
    });
    check("the service is created", created.status === 201, `status ${created.status}`);
    check("it gets an id from its name", created.body.service.id === "test-notes-app");
    check("it is scored immediately", typeof created.body.cost.score === "number");
    check(
      "a service with no export scores badly",
      created.body.cost.score > 40,
      `scored ${created.body.cost.score}`
    );

    const duplicate = await json("/api/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test Notes App" }),
    });
    check("adding it twice is refused", duplicate.status === 409);

    const nameless = await json("/api/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ monthlyUsd: 5 }),
    });
    check("a service with no name is refused", nameless.status === 400);

    const list = await json("/api/services");
    check("it appears in the portfolio", list.body.services.length === 7);

    const removed = await fetch(BASE + "/api/services/test-notes-app", { method: "DELETE" });
    check("it can be removed", removed.status === 200);

    const gone = await json("/api/services/test-notes-app");
    check("and is then a 404", gone.status === 404);

    const back = await json("/api/services");
    check("the portfolio is back to six", back.body.services.length === 6);
  }

  // --------------------------------------------------------------------
  scenario("Scenario 8. They print the exit report");
  {
    const page = await html("/report");
    check("the report page responds", page.status === 200);

    const { status, body } = await json("/api/report");
    check("the report API responds", status === 200);
    check("it opens with a sentence, not a number", body.headline.startsWith("Leaving everything"));
    check("it covers every service", body.services.length === 6);

    const scores = body.services.map((s: any) => s.score);
    const sorted = [...scores].sort((a: number, b: number) => b - a);
    check("the worst service is first", JSON.stringify(scores) === JSON.stringify(sorted));

    check(
      "the summary hours equal the sum of the parts",
      body.summary.hours === body.services.reduce((n: number, s: any) => n + s.hours, 0)
    );
    check(
      "services trapped by the override rule explain themselves",
      body.services.filter((s: any) => s.band === "trapped").every((s: any) => s.sentence.length > 20)
    );
  }

  // --------------------------------------------------------------------
  scenario("Scenario 9. Nobody opens the site for a week and the schedule runs on its own");
  {
    for (const id of ["evernote", "notion", "slack", "figma", "google-photos", "github"]) {
      await json(`/api/services/${id}/schedule`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schedule: "daily" }),
      });
    }

    const first = await json("/api/cron");
    check("the scheduled run responds", first.status === 200);
    check("it checked what was due", first.body.checked > 0, `checked ${first.body.checked}`);
    check(
      "it only reports what is worth telling a person",
      first.body.worthTelling.length <= first.body.checked
    );

    const second = await json("/api/cron");
    check(
      "running it again immediately checks nothing",
      second.body.checked === 0,
      `checked ${second.body.checked}`
    );
  }

  // --------------------------------------------------------------------
  scenario("Scenario 10. A link is wrong or a service does not exist");
  {
    const missing = await json("/api/services/does-not-exist");
    check("an unknown service is a 404", missing.status === 404);

    const missingRun = await fetch(BASE + "/api/services/does-not-exist/run", { method: "POST" });
    check("running an unknown service is a 404", missingRun.status === 404);

    const missingPage = await html("/services/does-not-exist");
    check("the page still renders rather than crashing", missingPage.status === 200);

    const notFound = await html("/no-such-page");
    check("an unknown page is a 404", notFound.status === 404);
  }

  // --------------------------------------------------------------------
  scenario("Scenario 11. The scoring model is checked without a server");
  {
    const services = seedServices();
    const costs = services.map((s) => ({ name: s.name, cost: exitCost(s) }));

    check("every score is within range", costs.every((c) => c.cost.score >= 0 && c.cost.score <= 100));
    check(
      "weights sum to one",
      Math.abs(costs[0].cost.factors.reduce((n, f) => n + f.weight, 0) - 1) < 1e-9
    );
    check(
      "every factor carries the evidence it came from",
      costs.every((c) => c.cost.factors.every((f) => f.evidence.length > 10))
    );

    const slack = costs.find((c) => c.name === "Slack")!;
    check(
      "Slack is trapped by the override rather than by the arithmetic",
      slack.cost.band === "trapped" && slack.cost.score < 55 && !!slack.cost.bandReason,
      `score ${slack.cost.score}, band ${slack.cost.band}`
    );

    const github = costs.find((c) => c.name === "GitHub")!;
    check("GitHub is portable", github.cost.band === "portable", `score ${github.cost.score}`);

    const summary = portfolio(services);
    check("the portfolio stranded count never exceeds the total", summary.strandedItems <= summary.totalItems);
    check("the worst service is the highest scoring one", summary.worst.cost.score === Math.max(...costs.map((c) => c.cost.score)));

    // A service whose export is complete should be cheap to leave.
    const perfect = { ...services[0], itemTypes: services[0].itemTypes.map((t) => ({ ...t, coverage: "full" as const })) };
    check("a complete export scores lower than a lossy one", exitCost(perfect).score < exitCost(services[0]).score);
  }

  // --------------------------------------------------------------------
  scenario("Scenario 12. An archive of a shape the checker has never seen");
  {
    const manifest: Manifest = {
      sourceName: "takeout-20260925.zip",
      sourceSize: 12_000_000,
      kind: "zip",
      truncated: false,
      entries: [
        { path: "Takeout/archive_browser.html", size: 4000, ext: "html" },
        { path: "Takeout/Google Photos/IMG_1.jpg", size: 2_000_000, ext: "jpg", parsed: "ok" },
        { path: "Takeout/Google Photos/IMG_1.jpg.json", size: 400, ext: "json", parsed: "ok" },
        { path: "Takeout/Google Photos/IMG_2.jpg", size: 2_100_000, ext: "jpg", parsed: "ok" },
        { path: "Takeout/Google Photos/IMG_2.jpg.json", size: 400, ext: "json", parsed: "ok" },
      ],
    };
    const inspection = inspectManifest(manifest);
    check("a Takeout archive is recognised", inspection.shape === "Google Takeout archive", inspection.shape);
    check(
      "the sidecar trap is reported",
      inspection.findings.some((f) => /sidecar/.test(f.title))
    );

    const gitManifest: Manifest = {
      sourceName: "repo.zip",
      sourceSize: 1000,
      kind: "zip",
      truncated: false,
      entries: [
        { path: ".git/HEAD", size: 23, ext: "" },
        { path: "README.md", size: 900, ext: "md", parsed: "ok" },
      ],
    };
    check("a git copy is recognised", inspectManifest(gitManifest).shape === "Git repository copy");

    const oneStray: Manifest = {
      sourceName: "mixed.zip",
      sourceSize: 1000,
      kind: "zip",
      truncated: false,
      entries: [
        { path: "a.enex", size: 100, ext: "enex", parsed: "ok" },
        ...Array.from({ length: 12 }, (_, i) => ({ path: `n${i}.md`, size: 100, ext: "md", parsed: "ok" as const })),
      ],
    };
    check(
      "one stray file does not rename the whole archive",
      inspectManifest(oneStray).shape === "Generic archive",
      inspectManifest(oneStray).shape
    );
  }

  // --------------------------------------------------------------------
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\nThe run itself failed:", error);
  console.error(`Is the server up at ${BASE}?`);
  process.exit(1);
});
