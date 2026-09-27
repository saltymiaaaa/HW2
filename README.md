# Exit Check

Keeps a working copy of your data outside the platforms you depend on, opens that copy to confirm it
is readable rather than merely downloaded, and tells you in one sentence what leaving each platform
would cost.

Part 2 of the product study *Three Products, Seven Questions*, built out into a working product.

---

## Start here

| If you have | Open |
| --- | --- |
| Two minutes | [`04-poster/Exit_Check_Poster_A2.pdf`](04-poster/Exit_Check_Poster_A2.pdf) |
| Ten minutes | [`03-brochure/Exit_Check_Brochure.pdf`](03-brochure/Exit_Check_Brochure.pdf) |
| A terminal | [`02-prototype`](02-prototype), then `npm install && npm run dev`, and open the landing page |
| The written work | [`01-product-idea/Product_Study_Phan_Ngoc_Anh_REVISED.docx`](01-product-idea/Product_Study_Phan_Ngoc_Anh_REVISED.docx) |
| An hour | [`05-documentation/PROJECT_DOCUMENTATION.md`](05-documentation/PROJECT_DOCUMENTATION.md) |

---

## What is in this folder

### `01-product-idea`

- `Product_Study_Phan_Ngoc_Anh_REVISED.docx` is the full study with Part 2 rewritten and expanded to
  around 2,000 words, informed by what the prototype turned out to do. Part 1, the figures and the
  references are untouched.
- `Product_Study_Phan_Ngoc_Anh_ORIGINAL_BACKUP.docx` is the document exactly as it was before.
- `Exit_Check_Product_Idea.md` is the same Part 2 as plain text.
- `part2_content.py` holds the text, and `apply_part2.py` writes it into the Word document. Editing
  the text and running the script again reapplies it, so the two copies cannot drift apart.

### `02-prototype`

A working Next.js application. One deployable unit, no database, no background worker, no API keys.

```bash
cd 02-prototype
npm install
npm run dev        # http://localhost:3000
```

Deploy by importing that folder at vercel.com/new, or running `npx vercel` inside it.

It opens on a landing page that explains what this is, what it produces and how to use it in three
steps. Behind that: the portfolio, one service in full with a check you can run and watch, the
export checker, a printable exit report, and an honest page about what is real and what is
simulated. Its own README covers the architecture and the API.

```bash
npm run build && npm start -- -p 3400   # in one terminal
npm run test:e2e                        # 12 user journeys, 81 assertions
npm run test:stress                     # 21 cases, each with a time budget
```

Both suites pass. The end to end suite walks a first visit, a live check run, a schedule change, a
real archive, rubbish input, adding and removing a service, the printed report, a week of unattended
scheduled runs, broken links, the scoring model on its own and unfamiliar archive shapes. The stress
suite pushes the checker to a 120,000 file manifest and a real 12,000 file zip, throws files at it
that are designed to break it, and puts the API under concurrent load including twelve simultaneous
check runs.

**The part worth trying first** is `/verify`. Drop in a real export archive, or press **Try it with a
sample export**. The archive is opened in your browser and never uploaded, and the checker is real
code: it parses JSON, CSV, XML and ENEX files rather than counting them, compares images against
their actual first bytes, and reports zero byte files, nested archives, duplicate paths,
unrestorable paths and metadata stranded in sidecar files.

### `03-brochure`

`brochure.html` and a four page A4 PDF. Open the HTML in a browser and print to PDF to regenerate
it. `assets/` holds the screenshots it uses.

### `04-poster`

`poster.html` and an A2 portrait PDF. Same approach: the HTML is the source.

### `05-documentation`

`PROJECT_DOCUMENTATION.md` is the project record: where the idea came from, the scoring model and
the two refinements that building it forced, every architecture decision with what it cost, an
honest table of what is real and what is simulated, how it was tested, the design tokens, the known
limits and what would come next. `screenshots/` holds one capture of each screen.

---

## The idea in one paragraph

The cost of leaving a service stays unknown until the moment you need to leave, which is also the
moment you have the least time to deal with it. Exit Check runs each platform's own export on a
schedule, stores the result where you control it, opens it to confirm it is readable, and reports
what did not come out. The output is one sentence per service:

> Leaving Notion today would take about 34 hours and no direct spend, and you would leave behind
> databases, database relations, comments, sharing and permissions and page history.

No model is involved anywhere. The score is six weighted factors read from fields you can inspect,
shown next to the evidence that produced each one, because a number you cannot argue with is a
number you cannot trust.

---

## Requirements

Node 20 or newer for the prototype. Any browser for the brochure and the poster. Python with
`python-docx` only if you want to re-run the Part 2 script.
