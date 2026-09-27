# Exit Check

**Personal project documentation**
Version 1.1 · 26 September 2026

Companion to *Three Products, Seven Questions*, Part 2. This document records what was built, why
each decision was taken, what is genuinely working and what is deliberately faked.

---

## Contents

1. [What this is](#1-what-this-is)
2. [Where the idea came from](#2-where-the-idea-came-from)
3. [The product in one page](#3-the-product-in-one-page)
4. [Who it is for](#4-who-it-is-for)
5. [The exit cost model](#5-the-exit-cost-model)
6. [The archive checker](#6-the-archive-checker)
7. [Architecture and decisions](#7-architecture-and-decisions)
8. [What is real and what is simulated](#8-what-is-real-and-what-is-simulated)
9. [Running and deploying it](#9-running-and-deploying-it)
10. [How it was tested](#10-how-it-was-tested)
11. [Design system](#11-design-system)
12. [Limits, risks and open questions](#12-limits-risks-and-open-questions)
13. [What would come next](#13-what-would-come-next)
14. [File map](#14-file-map)
15. [Sources](#15-sources)

---

## 1. What this is

Exit Check keeps a working copy of your data outside the platforms you depend on, opens that copy to
confirm it is readable rather than merely downloaded, and tells you in one sentence what leaving
each platform would cost.

The deliverable in this folder is a working prototype, a brochure, a poster and this document. The
prototype is a single Next.js application that deploys to one Vercel project with no database, no
background worker and no API keys. It opens on a landing page that explains itself, and it carries
two test suites: twelve end to end journeys and twenty one stress cases. The archive checker inside
it is real code doing real work, not a mock.

The whole product produces one sentence per service:

> Leaving Notion today would take about 34 hours and no direct spend, and you would leave behind
> databases, database relations, comments, sharing and permissions and page history.

Everything else exists to make that sentence defensible.

---

## 2. Where the idea came from

The study compared Harbor, Termphin and Launchie, and found that all three solve a problem created
by a decision at a larger company rather than by a limit in technology. Harbor competes with a
pricing decision, Termphin with an unreliable network, and Launchie with a feature Apple removed.

Two conclusions from that study drove this idea directly.

**The conclusion that the risk is a reversal.** Two of those three products lose their central
argument if the company that caused the problem changes its mind. Termphin is the exception, because
a mobile connection will not be made reliable by any company decision. The question that follows is
which other problems have that property.

**The detail borrowed from Harbor.** Harbor states its pricing rule as a number inside the product,
which can be checked later, and publishes its exit as plainly as its features. That is the honest
version of a promise. Exit Check takes the same move and applies it to the thing nobody states as a
number at all, which is what it would cost to leave.

The cost of leaving a service stays unknown until the moment you need to leave, which is also the
moment you have the least time to deal with it. That problem cannot be withdrawn by a vendor, since
no vendor has an incentive to publish it. It is Termphin shaped rather than Launchie shaped.

---

## 3. The product in one page

Four steps, and the third one is the product.

| Step | What happens | Why it matters |
| --- | --- | --- |
| 1. Export | Run the platform's own published export on a schedule: daily, weekly or monthly | An export nobody performs is not an export you have. Friction is recorded and scored. |
| 2. Store | Write the copy to storage the user controls | Exit Check never holds the only copy. Replacing one dependency with another is not an exit. |
| 3. **Verify** | Open the archive. Parse every structured file. Compare the copy against the platform, item type by item type | A download that has never been opened is indistinguishable from a truncated one. |
| 4. Report | One sentence: hours, money, and exactly what would be left behind | This is the output. Nothing else is. |

Most backup tools stop after step two. The interesting product is step three, because it converts a
folder of archives into an answer.

### The screens that carry those steps

| Route | What it is for |
| --- | --- |
| `/` | The landing page. What this is, what it produces, how to use it in three steps, what the score means, and the questions people ask first. |
| `/portfolio` | One card per platform, with its exit cost, its last verified copy and its sentence. |
| `/services/[id]` | One platform in full: the six factors with their evidence, the item by item inventory, the price history, every copy taken so far, and a check you can run and watch. |
| `/verify` | The part that is real. Drop in a genuine export and get a verdict. |
| `/report` | The printable exit report across everything being watched. |
| `/how-it-works` | The method, and an honest table of what is real and what is simulated. |

Every inner page opens with a plain language strip saying what you are looking at, and the portfolio
is labelled as demo data wherever it appears. Somebody who has never seen this should not need to
read any of this document to use it.

---

## 4. Who it is for

Individuals and small teams holding years of work inside subscription tools. Concretely: someone
with a decade of notes in Evernote, a wiki and a client tracker in Notion, six years of team
decisions in a free Slack, a design system in Figma and every photograph since 2013 in Google
Photos.

This is the same group Harbor is aimed at, defined the same way the study observed: by something
they stand to lose rather than by a task they want to finish. That definition is narrow, and it has
one advantage. The claim is testable. You can ask whether the loss was actually measured.

It is not for enterprises. Enterprises have procurement, legal retention obligations and their own
exit clauses. The value here is for people whose leverage over a platform is zero.

---

## 5. The exit cost model

Every service scores from 0 to 100. Zero means you could leave today; 100 means the data is
effectively hostage. The score is arithmetic over fields you can inspect, and no model is involved
anywhere. A number you cannot argue with is a number you cannot trust, so each factor is displayed
next to the sentence it was derived from.

### The six factors

| Factor | Weight | Derived from |
| --- | --- | --- |
| What the export leaves behind | 0.32 | Coverage per item type, and the measured share that survives when coverage is partial |
| Cost of being running somewhere else | 0.20 | Hours and direct spend to be operational elsewhere |
| Whether another tool can open it | 0.14 | Share of exported bytes in open formats |
| How fast the price moves under you | 0.14 | Compound annual growth of the subscription price |
| Work required to get the export at all | 0.10 | API, manual action, emailed request, or no export |
| What happens after you stop paying | 0.10 | Read only, grace period of N days, or deletion |

Bands: under 30 is **portable**, under 55 is **sticky**, 55 and above is **trapped**.

### Two refinements that changed the answers

**Partial is not half.** The first version treated any partial coverage as 0.5. That is a lie the
score then inherits, because ninety days of a six year archive and a formula that arrives as a
static value are not the same kind of partial. Item types now carry an optional measured recovery
share. Slack's public channel history on the free plan is 0.04, not 0.5.

**One rule overrides the arithmetic.** A weighted average can hide the single thing that matters. If
more than a quarter of what you hold cannot be exported at all, the service counts as trapped
whatever the weighted score says. Slack scores 53 on the factors and is trapped by this rule,
because moving quickly does not help with data that never comes out. The interface says so
explicitly rather than quietly adjusting the number.

### The demo portfolio, scored

| Service | Score | Band | Why |
| --- | --- | --- | --- |
| Notion | 64 | Trapped | Comments, relations, permissions and page history are in no export format |
| Evernote | 54 | Trapped | Handwriting index and version history stay on the server; price up 9 percent a year |
| Slack, free plan | 53 | Trapped | 94 percent of six years of messages is unreachable before you even ask to leave |
| Figma | 46 | Sticky | The files download, and only Figma opens them |
| Google Photos | 28 | Portable | Originals come out; dates land in sidecar files most importers ignore |
| GitHub | 26 | Portable | A clone is a complete copy. This is what low exit cost looks like |

The spread is the useful part. Five of the six are platforms people describe as good products, and
the score is not a judgement of the product. It is a measurement of one specific thing.

---

## 6. The archive checker

This is the part of the prototype that is fully real, and the part worth showing first.

### What it does

Drop a genuine export archive on `/verify`. The browser opens the zip, parses what it can, and
builds a manifest: file names, sizes and parse results. Only that manifest is posted to the server,
which scores it and returns a verdict.

The archive itself is never uploaded. A product that asks people to prove they can leave a platform
should not begin by uploading everything they own to a new one. This also keeps the request inside
the size limits of a serverless function, so the privacy argument and the engineering constraint
point the same way.

### What it detects

| Check | Why it is a real problem |
| --- | --- |
| JSON, NDJSON, CSV, XML and ENEX are parsed, not counted | A truncated file and a complete one have the same name and a plausible size |
| Image magic bytes are compared with the extension | Export servers return HTML error pages that get saved as `.jpg` |
| Zero byte files | They pass a file count check and hold nothing |
| Closed formats, by share of bytes | A copy you cannot open is storage, not an exit |
| Nested archives | No count in the report includes their contents |
| Metadata sidecar files | Dates and locations are present and every importer ignores them |
| Duplicate paths | On restore, one silently overwrites the other |
| Paths over 240 characters or with reserved characters | They will not restore on Windows, and you find out during the restore |
| Exports made only of rendered HTML | The layout survives and the structure underneath it does not |

The verdict is one of: opens and is complete, opens and something is missing, or does not reliably
open.

### The sample export

`/verify` has a button that builds a deliberately flawed archive in the browser, so the checker can
be tried without downloading personal data first. Every defect in it was observed in a genuine
export: a settings file with a trailing comma, a CSV whose rows stopped matching the header after an
unquoted comma, an ENEX cut off mid element, a photo whose first bytes are an HTML error page, dates
stranded in sidecars, a zero byte signed contract, a nested archive and a Figma file.

Run against that sample, the checker reports:

```
Generic archive | lossy | 17 files | 70 percent open formats

[fail] 4 files listed but not readable
[warn] 30 percent of this archive is in a closed format
[fail] 1 file is zero bytes
[warn] 1 archive inside this archive
[warn] 2 metadata sidecar files
[warn] 1 path will not restore on Windows
```

---

## 7. Architecture and decisions

One Next.js 15 application, TypeScript, App Router. React for the interface, route handlers for the
logic, one dependency beyond the framework.

```
Browser                          Vercel (one project)
  |                                |
  |-- reads the zip locally        |
  |   (fflate, never uploaded)     |
  |                                |
  |--- POST manifest ------------> /api/verify      -> lib/inspect.ts
  |--- POST run ----------------->  /api/services/[id]/run  (server sent events)
  |--- GET  report -------------->  /api/report     -> lib/score.ts
                                    /api/cron       <- Vercel Cron, daily
```

### Decisions, and what each one cost

**One deployable unit, no Python service.** Every piece of logic that would normally be a background
worker lives in a route handler. The whole thing is `npx vercel` with no infrastructure. The cost is
that a real connector doing a 1.4 TB Google Photos transfer would exceed a serverless function
timeout, so production would need a queue. That is a known and deferred problem, not an oversight.

**No model, anywhere.** The exit cost is arithmetic and the archive checker is parsers. Writing this
with a model would have been faster and the output would be unauditable, which would defeat the
argument the product is making. This mirrors the finding in the study: all three products ranked in
the top ten of a week dominated by agent products, and none of them uses a model, because what they
sell is control and reliability and a model supplies neither.

**Archive reading in the browser.** Chosen for the privacy argument first. It also solved the
request size limit, which is the sort of alignment that suggests the constraint was the right one.
The cost is a browser memory ceiling: archives over 220 MB are listed from the zip index rather than
decompressed, and the manifest is flagged as truncated so no total is presented as complete.

**State in the server process.** `lib/store.ts` holds the portfolio in memory. That is enough for a
prototype and it avoids provisioning a database for a demo. It is the only file that touches state,
so replacing it with Postgres or KV is the entire change needed to make this multi user. State
resets when the function is recycled, which is expected here and would not be acceptable in the real
product.

**Server sent events for the check run.** A check has stages worth showing, and a spinner says
nothing. `EventSource` cannot issue a POST, so the stream is read from a fetch body and parsed by
hand in `components/run-stream.tsx`. Twenty lines, and one fewer dependency.

**Hand written CSS.** No Tailwind, no component library, no build step beyond Next itself. The
brochure and the poster reuse the same tokens, so the three artefacts look like one product without
sharing a bundler.

---

## 8. What is real and what is simulated

Stated plainly, and also stated inside the product on the How it works page, because a prototype
that hides this is doing the thing this product exists to argue against.

| Part | State | Where |
| --- | --- | --- |
| Archive inspection | **Real** | `lib/read-archive.ts`, `lib/inspect.ts` |
| Exit cost scoring | **Real** | `lib/score.ts` |
| Scheduled runs | **Real** | `app/api/cron`, `vercel.json` |
| The event stream during a check | **Real** | `app/api/services/[id]/run`, `components/run-stream.tsx` |
| Platform connectors and the transfer | **Simulated** | `lib/simulate.ts` |
| Portfolio contents | **Demo data**, with real export behaviour | `lib/seed.ts` |
| Storage of state | **In memory** | `lib/store.ts` |

The simulated part is the part that is ordinary engineering: an OAuth flow and a download loop per
platform. The parts that decide whether the product is any good are the ones that are real.

---

## 9. Running and deploying it

```bash
cd 02-prototype
npm install
npm run dev        # http://localhost:3000
```

No environment variables, no account, no network calls. Node 20 or newer.

```bash
npm run build && npm start
npm run typecheck
```

Deploy by importing `02-prototype` at vercel.com/new, or `npx vercel` from inside it. Next.js is
detected automatically. `vercel.json` registers a daily cron on `/api/cron`, which runs every
service whose interval has elapsed. Setting `CRON_SECRET` makes that endpoint refuse calls Vercel
did not sign.

### The API

```bash
curl localhost:3000/api/report
curl localhost:3000/api/services
curl localhost:3000/api/services/notion
curl -N -X POST localhost:3000/api/services/notion/run
curl -X POST localhost:3000/api/services/notion/schedule \
     -H 'content-type: application/json' -d '{"schedule":"daily"}'
curl localhost:3000/api/cron
```

---

## 10. How it was tested

Two suites, written as journeys and cases rather than units, because what is worth protecting here
is that the screens still tell the truth together.

```bash
npm run build && npm start -- -p 3400
npm run test:e2e      # 12 journeys, 81 assertions
npm run test:stress   # 21 cases, each with a time budget
```

### End to end, 81 of 81 passing

| Journey | What it protects |
| --- | --- |
| 1. A first visit to the landing page | It says what the product produces, links to both entry points, explains the bands, and answers whether data is uploaded |
| 2. Reading the portfolio | Six services, every score in range, every sentence finished, and at least three distinct bands so the model discriminates |
| 3. Running a check | The plan arrives first, all seven steps start and finish, findings are emitted, the snapshot is recorded, and the completed score matches the scored one |
| 4. Changing a schedule | The change persists, and an unsupported interval is refused with an explanation |
| 5. Checking a real archive | The sample export opens, and all six classes of defect are named |
| 6. Feeding the endpoint rubbish | Bad JSON, a manifest with no entries and an empty archive are each handled distinctly, and the file list is not echoed back |
| 7. Adding and removing a service | Created, scored immediately, refused when duplicated or unnamed, removed, then a 404 |
| 8. Printing the report | Opens with a sentence, worst service first, and the summary hours equal the sum of the parts |
| 9. A week of unattended runs | The scheduled endpoint checks what is due, and checks nothing when run again immediately |
| 10. Broken links | Unknown services and pages return 404 rather than crashing |
| 11. The scoring model alone | Weights sum to one, every factor carries evidence, Slack is trapped by the override rather than by the arithmetic, and a complete export always scores lower than a lossy one |
| 12. Unfamiliar archive shapes | A Takeout archive and a git copy are recognised, and one stray file does not rename a whole archive |

### Stress, 21 of 21 inside budget

| Case | Result |
| --- | --- |
| Score a 120,000 file manifest | 587 ms |
| Score a 20,000 file manifest | 91 ms |
| Open and parse a real 12,000 file zip | 1,143 ms |
| Open and parse a real 2,000 file zip | 160 ms |
| A file that is not a zip at all | refused cleanly in 1 ms |
| A zip containing truncated JSON | the broken file is named |
| Unicode, spaces and reserved characters in paths | all read |
| A 4,000 character path | flagged as unrestorable |
| An archive of nothing but empty files | no division by zero |
| 500 nested archives inside one archive | flagged |
| 200 concurrent report requests | 2,042 ms, 200 of 200 |
| 100 concurrent service reads | 1,001 ms, 100 of 100 |
| 50 concurrent manifest checks | 947 ms, 50 of 50 |
| A 30,000 entry manifest over the wire | 262 ms |
| A manifest past the documented limit | 413, with an explanation |
| 12 people watching a check run at once | 6,581 ms, 12 of 12 completed |
| State after all of the above | six services, no score out of range |

### What the tests found

The scoring spread was the first thing they caught. The original model put all six services between
34 and 64, which is a model that discriminates nothing, and that is what produced the two
refinements in section 5. The suites now assert that at least three bands appear across the
portfolio, so that failure cannot come back quietly.

### What is not tested

The simulated connectors, because there is nothing to assert about them, and the interface
interactions, which were checked by hand and captured in `05-documentation/screenshots`.

## 11. Design system

One set of tokens across the prototype, the brochure and the poster.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--paper` | `#f6f4ef` | `#0e1013` | Page background |
| `--ink` | `#16181c` | `#ecebe6` | Body text |
| `--exit` | `#0b7a4b` | `#3fbd83` | The brand colour, and the portable band |
| `--sticky` | `#a9620b` | `#e0a15a` | The sticky band |
| `--trapped` | `#a32232` | `#e8798a` | The trapped band |

Typography is a system stack with no web fonts, so nothing is fetched at build or at run time: a
serif for headings and the verdict sentences, a sans for the interface, a monospace for every
number. Numbers are tabular throughout, because a score that shifts sideways as it changes looks
unreliable.

The mark is a container with an opening on one side and a check mark passing through it.

Two rules carry most of the visual weight. The verdict sentence is always set in the serif, at
larger size, with a coloured rule on the left in the band colour, so the one thing the product
produces looks different from everything explaining it. And a score is never shown without the
evidence that produced it next to it.

The interface adapts to the operating system light and dark setting and prints cleanly, since the
exit report is meant to be saved as a PDF and sent to somebody.

---

## 12. Limits, risks and open questions

**The honest engineering limits.** Connectors are simulated. State does not survive a function
restart. Archives over 220 MB are listed rather than opened. Nested archives are named and not
descended into. CSV row width checking is approximate, because quoted commas make an exact parse
more work than the finding is worth.

**The business risk is the one the study identified.** If a platform improves its export, that
service's score falls and the product loses an argument for it. The difference from Harbor and
Launchie is that no vendor has any incentive to make leaving easy, so a reversal by one company does
not remove the problem, and there is no single company that could.

**The real risk is demand, not defensibility.** People know the cost of leaving is unknown and
mostly do not want to be told. This has the shape of insurance: obviously worth it in hindsight,
easy to defer indefinitely. The counter is that it is cheapest to sell on the day a platform
announces a price rise, which is exactly when the product should send one sentence and nothing else.

**Open questions.** How many item types can be counted through a platform's API without a paid tier,
since the score depends on comparing held against exported. Whether re-entry hours can be measured
rather than estimated, perhaps from how long a real migration took. And whether the sentence should
name a specific destination, which would be more useful and would also make this a migration tool,
which it is deliberately not.

---

## 13. What would come next

In order, and each one is the smallest thing that would make the next one worth doing.

1. **One real connector.** GitHub, because the API is complete and a clone is genuinely verifiable
   end to end. It proves the loop works before any platform with an awkward export is attempted.
2. **Persistence.** Replace `lib/store.ts`. Everything else stays untouched, which is the point of
   the seam.
3. **A queue for large transfers.** The 1.4 TB case cannot live in a request.
4. **The notification.** One sentence, when a number moves, and silence otherwise. The product
   should not be a dashboard people visit.
5. **Price watching.** The price factor is currently entered by hand. Watching a pricing page is the
   cheapest early warning the product could offer, and it is the trigger that makes anyone care.
6. **Item counts through APIs.** Turn the coverage table from documented behaviour into measured
   behaviour.

---

## 14. File map

```
exit-check/
  README.md                    what is in this folder and where to start
  01-product-idea/             the expanded product idea, as text and as a Word document
  02-prototype/                the working Next.js application
    app/                       landing page, portfolio, service, verify, report, API routes
    lib/                       scoring, inspection, archive reading, demo data
    components/                nav, score ring, sparkline, run stream
    scripts/                   e2e.mts and stress.mts
    README.md                  how to run, test and deploy it
  03-brochure/                 brochure.html and a three page A4 PDF
  04-poster/                   poster.html and an A2 PDF
  05-documentation/            this document, and screenshots of every screen
```

---

## 15. Sources

Product Hunt. (2026a, September 20). *Daily leaderboard, 20 September 2026*.
<https://www.producthunt.com/leaderboard/daily/2026/9/20>

Product Hunt. (2026b). *Harbor*. <https://www.producthunt.com/products/harbor-2>

Product Hunt. (2026c). *Launchie*. <https://www.producthunt.com/products/launchie>

Product Hunt. (2026d). *Termphin*. <https://www.producthunt.com/products/termphin>

Export behaviour described for Evernote, Notion, Slack, Figma, Google Photos and GitHub is taken
from each platform's published export documentation as of September 2026. The volumes attached to
them in the demo portfolio are plausible personal figures, not measurements, and are labelled as
demo data inside the prototype.
