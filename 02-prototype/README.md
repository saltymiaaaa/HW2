# Exit Check, working prototype

Keeps a verified copy of your data outside the platforms you depend on, and tells you what leaving
each one would cost.

One Next.js application. Every piece of logic lives in this repository, including the parts that
would normally be a background worker, so the whole thing deploys as a single Vercel project with
no database, no Python service and no external API keys.

---

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Nothing else is needed. No environment variables, no account, no network calls to anything.

```bash
npm run build && npm start   # production build
npm run typecheck            # types only
```

## Test it

```bash
npm run build && npm start -- -p 3400   # in one terminal
npm run test:e2e                        # in another
npm run test:stress
```

`npm run test:e2e` walks twelve user journeys and makes 81 assertions: a first visit, running a
check and watching it stream, changing a schedule, checking a real archive, feeding the endpoint
rubbish, adding and removing a service, printing the report, a week of unattended scheduled runs,
broken links, the scoring model on its own, and archive shapes the checker has never seen.

`npm run test:stress` runs 21 cases with a time budget on each: manifests up to 120,000 files, real
zips up to 12,000 files, files designed to break the reader, and the API under concurrent load
including twelve simultaneous check runs.

Both suites point at `BASE_URL`, which defaults to `http://127.0.0.1:3400`.

Node 20 or newer.

## Deploy it

Push this folder to a repository and import it at <https://vercel.com/new>, or:

```bash
npx vercel
```

Framework detection picks Next.js on its own. `vercel.json` registers one daily cron that calls
`/api/cron`, which runs every service whose schedule has elapsed. Set `CRON_SECRET` in the project
if you want that endpoint to refuse calls that Vercel did not sign.

---

## The screens

| Route | What it is for |
| --- | --- |
| `/` | The landing page. What this is, what it produces, how to use it in three steps, what the score means, and the questions people ask first. |
| `/portfolio` | One card per platform, each with its exit cost, its last verified copy and the sentence that summarises it. |
| `/services/[id]` | One platform in full: the six scoring factors with their evidence, the item by item inventory, price history, every copy taken so far, and a live check you can run. |
| `/verify` | **The part that is real.** Drop an actual export archive and get a verdict on whether it opens, what is closed, what is empty and what would cost you time. |
| `/report` | The printable exit report across everything being watched. |
| `/how-it-works` | The method, and an honest table of what is real here and what is simulated. |

## Try the part that is real

Go to `/verify` and either drop a genuine export (Google Takeout, a Slack export, a Notion export,
an `.enex`, a `.json`, a `.csv`) or press **Try it with a sample export**. The sample is generated
in the browser and contains defects taken from real exports: a JSON file with a trailing comma, a
CSV whose rows stopped matching the header, a photo whose bytes are not a photo, dates stranded in
sidecar files, a zero byte attachment, a nested archive and a design file only its vendor can open.

The archive is read in the browser. Only the manifest, which is file names, sizes and parse
results, is posted to the server. A product that asks people to prove they can leave a platform
should not start by uploading everything they own to a new one.

---

## Architecture

```
app/
  page.tsx                     landing page
  portfolio/page.tsx           the portfolio
  services/[id]/page.tsx       one platform, with the live check
  verify/page.tsx              real archive checker
  report/page.tsx              printable report
  how-it-works/page.tsx        method, and what is simulated
  api/
    services/                  GET list, POST add
    services/[id]/             GET one, DELETE
    services/[id]/run/         POST, server sent events, streams a check
    services/[id]/schedule/    POST, change the interval
    verify/                    POST a manifest, get a verdict
    report/                    GET the whole portfolio in one answer
    cron/                      GET, the scheduled run, called by Vercel Cron
lib/
  types.ts                     the shared vocabulary
  score.ts                     exit cost: six weighted factors, no model
  inspect.ts                   manifest to verdict, the real checker
  read-archive.ts              reads a zip in the browser without uploading it
  sample-export.ts             builds a deliberately flawed archive to test with
  simulate.ts                  the check run, as steps
  seed.ts                      the demo portfolio
  store.ts                     state, and the seam where a database would go
  format.ts                    bytes, dates, verdict wording
components/
  nav, logo, score-ring, sparkline, run-stream
scripts/
  e2e.mts                      twelve user journeys, 81 assertions
  stress.mts                   21 cases, each with a time budget
```

### Exit cost

Six weighted factors, each read from a field on the service record:

| Factor | Weight | Read from |
| --- | --- | --- |
| What the export leaves behind | 0.32 | item coverage and measured recovery share |
| Cost of being running somewhere else | 0.20 | re-entry hours and spend |
| Whether another tool can open it | 0.14 | share of bytes in open formats |
| How fast the price moves under you | 0.14 | compound growth of the price history |
| Work required to get the export | 0.10 | API, manual, request or none |
| What happens after you stop paying | 0.10 | deletion policy and grace period |

Under 30 is portable, under 55 is sticky, above that is trapped. One rule overrides the
arithmetic: if more than a quarter of what you hold cannot be exported at all, the service is
trapped whatever the weighted score says, because a fast move does not help with data that never
comes out.

No model produces any of this, which is the point. A number you cannot argue with is a number you
cannot trust, so every factor on screen shows the sentence it was derived from.

### State

`lib/store.ts` keeps the portfolio in the server process. That is enough for a prototype and for a
single deployment used by one person, and it keeps the project at one deployable unit. It is the
only file that touches state, so swapping it for Postgres or KV is the entire change required to
make this multi user.

State resets when the serverless function is recycled, which is expected here and would not be
acceptable in the real product.

### What is real, and what is not

| Part | State |
| --- | --- |
| Export archive inspection | Real. Parses JSON, NDJSON, CSV, XML and ENEX, checks image magic bytes, finds empty files, nested archives, duplicate paths, unrestorable paths and metadata sidecars. |
| Exit cost scoring | Real arithmetic over the service record. |
| Scheduled runs | Real. `vercel.json` cron calls `/api/cron`. |
| The event stream during a check | Real server sent events, consumed by `components/run-stream.tsx`. |
| Platform connectors and the transfer itself | Simulated in `lib/simulate.ts`. Implementing `fetchExport` per platform is the work that would make this a product. |
| The portfolio contents | Demo data in `lib/seed.ts`, with real export behaviour and plausible personal volumes. |

## API

```bash
curl localhost:3000/api/report
curl localhost:3000/api/services
curl localhost:3000/api/services/notion
curl -N -X POST localhost:3000/api/services/notion/run      # server sent events
curl -X POST localhost:3000/api/services/notion/schedule \
     -H 'content-type: application/json' -d '{"schedule":"daily"}'
curl localhost:3000/api/cron
```

## Licence

Prototype, written for a product study. Use it however is useful.
