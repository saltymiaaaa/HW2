import type { Service } from "./types";

/**
 * The demo portfolio. These are real platforms with export behaviour that is
 * publicly documented, filled in with plausible personal volumes so the
 * product can be judged without connecting anything.
 *
 * Nothing here is fetched at runtime. Replace a service with your own numbers
 * and every screen updates, because every screen reads the same fields.
 */

const day = 24 * 3600 * 1000;
const ago = (days: number) => new Date(Date.now() - days * day).toISOString();

export function seedServices(): Service[] {
  return [
    {
      id: "evernote",
      name: "Evernote",
      vendor: "Bending Spoons",
      category: "Notes",
      holds: "Eleven years of notes, scanned receipts and clipped articles.",
      plan: "Personal",
      monthlyUsd: 14.99,
      yearsStored: 11,
      exportMethod: "manual",
      exportFormats: ["enex", "html"],
      openFormatRatio: 0.55,
      itemTypes: [
        { key: "notes", label: "Notes", count: 4182, coverage: "full", note: "Body text and formatting survive the ENEX export." },
        { key: "attachments", label: "Attachments", count: 1140, coverage: "full", note: "Attachments are inlined as base64 inside the ENEX file." },
        { key: "notebooks", label: "Notebook structure", count: 38, coverage: "partial", recovered: 0.7, note: "Stacks flatten into a single level on export." },
        { key: "tags", label: "Tags", count: 214, coverage: "full", note: "Tags are written per note and reimport cleanly." },
        { key: "ocr", label: "Handwriting search index", count: 1140, coverage: "none", note: "The searchable layer over scans is generated on the server and is not part of the export." },
        { key: "history", label: "Note version history", count: 9600, coverage: "none", note: "Only the current revision of each note is exported." },
        { key: "shares", label: "Shared note links", count: 61, coverage: "none", note: "Public links break the moment the account closes." }
      ],
      priceHistory: [
        { date: "2019-01-01", usd: 7.99 },
        { date: "2022-01-01", usd: 9.99 },
        { date: "2024-01-01", usd: 12.99 },
        { date: "2026-01-01", usd: 14.99 }
      ],
      deletion: {
        policy: "grace",
        graceDays: 30,
        note: "Account content is held for 30 days after cancellation, then removed."
      },
      reentry: {
        hours: 26,
        usd: 0,
        note: "ENEX imports into most note apps, but the notebook layout is rebuilt by hand"
      },
      destination: "~/ExitCheck/evernote",
      schedule: "weekly",
      snapshots: [
        {
          id: "evernote-3",
          serviceId: "evernote",
          startedAt: ago(4),
          finishedAt: ago(4),
          sizeBytes: 3980112000,
          fileCount: 39,
          verdict: "lossy",
          missing: ["Handwriting search index", "Note version history", "Shared note links"],
          degraded: ["Notebook structure"],
          notes: [
            "The export opened and every ENEX file parsed to the end.",
            "Stacks were flattened, so 38 notebooks arrived as one level.",
            "Handwriting inside 1,140 scans is present as an image and is no longer searchable."
          ],
          exitCost: 53,
          delta: { added: 31, removed: 0, changed: 12 }
        },
        {
          id: "evernote-2",
          serviceId: "evernote",
          startedAt: ago(11),
          finishedAt: ago(11),
          sizeBytes: 3942004000,
          fileCount: 38,
          verdict: "lossy",
          missing: ["Handwriting search index", "Note version history"],
          degraded: ["Notebook structure"],
          notes: ["First run after the January price change. Export behaviour unchanged."],
          exitCost: 51,
          delta: { added: 18, removed: 2, changed: 7 }
        }
      ]
    },
    {
      id: "notion",
      name: "Notion",
      vendor: "Notion Labs",
      category: "Documents and databases",
      holds: "The company wiki, the client tracker and four years of meeting notes.",
      plan: "Plus",
      monthlyUsd: 10,
      yearsStored: 4,
      exportMethod: "manual",
      exportFormats: ["markdown", "csv", "html"],
      openFormatRatio: 0.78,
      itemTypes: [
        { key: "pages", label: "Pages", count: 1860, coverage: "full", note: "Pages export as Markdown with their text intact." },
        { key: "databases", label: "Databases", count: 24, coverage: "partial", recovered: 0.6, note: "Rows come out as CSV, and formulas and rollups arrive as flat values." },
        { key: "relations", label: "Database relations", count: 96, coverage: "none", note: "Links between databases are written as page titles, not as references." },
        { key: "comments", label: "Comments", count: 3120, coverage: "none", note: "Comment threads are not included in any export format." },
        { key: "files", label: "Uploaded files", count: 740, coverage: "full", note: "Files are downloaded next to the page that referenced them." },
        { key: "permissions", label: "Sharing and permissions", count: 52, coverage: "none", note: "Who could see what is not represented in the export." },
        { key: "history", label: "Page history", count: 30000, coverage: "none", note: "Version history stays on the platform." }
      ],
      priceHistory: [
        { date: "2022-01-01", usd: 8 },
        { date: "2024-06-01", usd: 10 }
      ],
      deletion: {
        policy: "delete",
        graceDays: 0,
        note: "Workspace content is removed after the billing period ends."
      },
      reentry: {
        hours: 34,
        usd: 0,
        note: "the pages move easily and the databases have to be rebuilt as tables"
      },
      destination: "~/ExitCheck/notion",
      schedule: "weekly",
      snapshots: [
        {
          id: "notion-4",
          serviceId: "notion",
          startedAt: ago(2),
          finishedAt: ago(2),
          sizeBytes: 812400000,
          fileCount: 2641,
          verdict: "lossy",
          missing: ["Database relations", "Comments", "Sharing and permissions", "Page history"],
          degraded: ["Databases"],
          notes: [
            "Every Markdown file opened and 24 CSV exports parsed with consistent column counts.",
            "3,120 comments are on the platform and in none of the exported files.",
            "Nine formula columns arrived as static text, so the calculation is gone even though the answer is there."
          ],
          exitCost: 62,
          delta: { added: 47, removed: 3, changed: 88 }
        }
      ]
    },
    {
      id: "slack",
      name: "Slack",
      vendor: "Salesforce",
      category: "Team messages",
      holds: "Six years of decisions that were never written down anywhere else.",
      plan: "Free",
      monthlyUsd: 0,
      yearsStored: 6,
      exportMethod: "request",
      exportFormats: ["json"],
      openFormatRatio: 0.95,
      itemTypes: [
        { key: "public", label: "Public channel messages", count: 184000, coverage: "partial", recovered: 0.04, note: "The free plan serves the most recent 90 days, so the export stops there." },
        { key: "private", label: "Private channel messages", count: 42000, coverage: "none", note: "Private channels need a paid plan and an approved request." },
        { key: "dms", label: "Direct messages", count: 91000, coverage: "none", note: "Direct messages are not included in a standard export." },
        { key: "files", label: "Uploaded files", count: 5400, coverage: "partial", recovered: 0.15, note: "The export stores links to files rather than the files themselves." },
        { key: "threads", label: "Thread structure", count: 12800, coverage: "full", note: "Parent and reply identifiers are present in the JSON." },
        { key: "canvas", label: "Canvases and lists", count: 210, coverage: "none", note: "Newer document types are not covered by the export format." }
      ],
      priceHistory: [{ date: "2020-01-01", usd: 0 }],
      deletion: {
        policy: "delete",
        graceDays: 0,
        note: "History beyond 90 days is already unreachable on the free plan, before any cancellation."
      },
      reentry: {
        hours: 12,
        usd: 0,
        note: "there is little to move, because most of it cannot be retrieved in the first place"
      },
      destination: "~/ExitCheck/slack",
      schedule: "monthly",
      snapshots: [
        {
          id: "slack-2",
          serviceId: "slack",
          startedAt: ago(9),
          finishedAt: ago(9),
          sizeBytes: 96300000,
          fileCount: 1204,
          verdict: "lossy",
          missing: ["Private channel messages", "Direct messages", "Canvases and lists"],
          degraded: ["Public channel messages", "Uploaded files"],
          notes: [
            "Every JSON file parsed. The format is not the problem here.",
            "The oldest message in the export is 90 days old. Six years of history exists and is not reachable.",
            "5,400 file references point at URLs that stop working when the workspace closes."
          ],
          exitCost: 51,
          delta: { added: 2900, removed: 2850, changed: 0 }
        }
      ]
    },
    {
      id: "figma",
      name: "Figma",
      vendor: "Figma",
      category: "Design files",
      holds: "The design system and every source file behind the product.",
      plan: "Professional",
      monthlyUsd: 15,
      yearsStored: 3,
      exportMethod: "manual",
      exportFormats: ["fig", "png", "svg", "pdf"],
      openFormatRatio: 0.22,
      itemTypes: [
        { key: "files", label: "Design files", count: 312, coverage: "partial", recovered: 0.3, note: "Files download as .fig, which only Figma opens." },
        { key: "frames", label: "Frames as images", count: 8400, coverage: "full", note: "Frames export to SVG and PNG, which any tool reads." },
        { key: "components", label: "Components and variants", count: 640, coverage: "none", note: "Component logic does not exist outside the .fig container." },
        { key: "variables", label: "Variables and tokens", count: 380, coverage: "partial", recovered: 0.5, note: "Tokens can be pulled through the API, and only on the paid plan." },
        { key: "prototypes", label: "Prototype links", count: 120, coverage: "none", note: "Interaction wiring has no export format at all." },
        { key: "comments", label: "Comments", count: 2100, coverage: "partial", recovered: 0.6, note: "Comments are reachable through the API but not through the interface export." }
      ],
      priceHistory: [
        { date: "2023-01-01", usd: 12 },
        { date: "2025-03-01", usd: 15 }
      ],
      deletion: {
        policy: "read-only",
        graceDays: 90,
        note: "Files become view only rather than being removed, which is the least damaging policy in this portfolio."
      },
      reentry: {
        hours: 60,
        usd: 240,
        note: "the design system would be rebuilt from images in another tool"
      },
      destination: "~/ExitCheck/figma",
      schedule: "weekly",
      snapshots: [
        {
          id: "figma-3",
          serviceId: "figma",
          startedAt: ago(1),
          finishedAt: ago(1),
          sizeBytes: 5120400000,
          fileCount: 8712,
          verdict: "lossy",
          missing: ["Components and variants", "Prototype links"],
          degraded: ["Design files", "Variables and tokens", "Comments"],
          notes: [
            "312 .fig files downloaded and none of them can be opened by anything other than Figma.",
            "8,400 frames were also written as SVG, so the pictures survive even though the system behind them does not.",
            "This is the clearest case in the portfolio of a copy that exists and still does not count as an exit."
          ],
          exitCost: 44,
          delta: { added: 210, removed: 0, changed: 640 }
        }
      ]
    },
    {
      id: "google-photos",
      name: "Google Photos",
      vendor: "Google",
      category: "Photos",
      holds: "Every photograph taken since 2013, including the only copies from two phones.",
      plan: "Google One 2 TB",
      monthlyUsd: 9.99,
      yearsStored: 13,
      exportMethod: "request",
      exportFormats: ["jpg", "mp4", "json"],
      openFormatRatio: 0.98,
      itemTypes: [
        { key: "photos", label: "Photos", count: 74200, coverage: "full", note: "Original files are included at full resolution." },
        { key: "videos", label: "Videos", count: 3100, coverage: "full", note: "Videos come out as the original MP4." },
        { key: "metadata", label: "Dates and locations", count: 77300, coverage: "partial", recovered: 0.8, note: "Metadata arrives in sidecar JSON files rather than inside the images." },
        { key: "albums", label: "Albums", count: 420, coverage: "partial", recovered: 0.7, note: "Albums become folders, and a photo in two albums is written twice." },
        { key: "faces", label: "People groupings", count: 180, coverage: "none", note: "Face clusters are an account feature and are not exported." },
        { key: "edits", label: "Non destructive edits", count: 6200, coverage: "none", note: "Edits are discarded and the original is what you get." }
      ],
      priceHistory: [
        { date: "2018-01-01", usd: 9.99 },
        { date: "2026-01-01", usd: 9.99 }
      ],
      deletion: {
        policy: "grace",
        graceDays: 60,
        note: "Content over the free quota becomes eligible for deletion 60 days after the subscription lapses."
      },
      reentry: {
        hours: 18,
        usd: 120,
        note: "the storage has to exist somewhere before the copy is worth anything"
      },
      destination: "~/ExitCheck/google-photos",
      schedule: "monthly",
      snapshots: [
        {
          id: "gphotos-2",
          serviceId: "google-photos",
          startedAt: ago(21),
          finishedAt: ago(20),
          sizeBytes: 1412000000000,
          fileCount: 81930,
          verdict: "lossy",
          missing: ["People groupings", "Non destructive edits"],
          degraded: ["Dates and locations", "Albums"],
          notes: [
            "The export arrived as 46 archives and every one of them opened.",
            "Dates live in sidecar JSON. Most photo tools ignore those files, so the dates look lost even though they are present.",
            "1.4 TB is the reason this runs monthly rather than weekly."
          ],
          exitCost: 29,
          delta: { added: 1240, removed: 0, changed: 0 }
        }
      ]
    },
    {
      id: "github",
      name: "GitHub",
      vendor: "Microsoft",
      category: "Code",
      holds: "Forty repositories and the issues that explain why the code looks like that.",
      plan: "Pro",
      monthlyUsd: 4,
      yearsStored: 9,
      exportMethod: "api",
      exportFormats: ["git", "json"],
      openFormatRatio: 1,
      itemTypes: [
        { key: "repos", label: "Repositories", count: 40, coverage: "full", note: "A clone is a complete copy, including every commit." },
        { key: "issues", label: "Issues and pull requests", count: 2400, coverage: "full", note: "Both are available as JSON through the API." },
        { key: "releases", label: "Releases and assets", count: 180, coverage: "full", note: "Binaries attached to releases download through the same API." },
        { key: "actions", label: "Action run history", count: 9800, coverage: "partial", recovered: 0.15, note: "Logs expire on the platform before an export can reach them." },
        { key: "wiki", label: "Wikis", count: 12, coverage: "full", note: "A wiki is a git repository and clones like one." }
      ],
      priceHistory: [
        { date: "2019-01-01", usd: 7 },
        { date: "2023-01-01", usd: 4 }
      ],
      deletion: {
        policy: "read-only",
        graceDays: 90,
        note: "Dropping to the free plan keeps public repositories reachable rather than removing them."
      },
      reentry: {
        hours: 4,
        usd: 0,
        note: "git was designed to be moved, so the repositories are already portable"
      },
      destination: "~/ExitCheck/github",
      schedule: "daily",
      snapshots: [
        {
          id: "github-6",
          serviceId: "github",
          startedAt: ago(1),
          finishedAt: ago(1),
          sizeBytes: 22400000000,
          fileCount: 40,
          verdict: "readable",
          missing: [],
          degraded: ["Action run history"],
          notes: [
            "All 40 clones verified against their remote heads.",
            "2,400 issues were written as JSON and every file parsed.",
            "This is what a low exit cost looks like, and it is the exception in this portfolio rather than the norm."
          ],
          exitCost: 25,
          delta: { added: 6, removed: 0, changed: 14 }
        }
      ]
    }
  ];
}
