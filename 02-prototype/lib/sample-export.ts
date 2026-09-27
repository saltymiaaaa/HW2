"use client";

import { zipSync, strToU8 } from "fflate";

/**
 * Builds a deliberately flawed export archive in the browser, so the checker
 * can be tried without anyone downloading their own data first.
 *
 * Every defect in here is one observed in a real export from a real platform:
 * a JSON file with a trailing comma, a CSV whose rows stopped matching the
 * header, a photo that is not the format its name claims, dates stranded in
 * sidecar files, a zero byte attachment, a nested archive nothing counts, and
 * a design file that only its vendor can open.
 */
export function buildSampleExport(): Blob {
  const longName =
    "sample-export/notes/" +
    "a-note-title-that-the-platform-wrote-straight-into-the-filename-".repeat(4) +
    "final.md";

  const jpegHeader = new Uint8Array(2048);
  jpegHeader.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

  const fakeJpeg = strToU8(
    "This file is named IMG_0412.jpg and contains an HTML error page from the export server."
  );

  const figBlob = new Uint8Array(180_000);
  figBlob.set(strToU8("fig-kiwi"));

  // A real PDF, so the archive is not made almost entirely of the one closed file.
  const pdfBlob = new Uint8Array(420_000);
  pdfBlob.set(strToU8("%PDF-1.7\n%binary-marker\n"));

  const nestedZip = zipSync({
    "archive-2019/old-notes.md": strToU8("# 2019\n\nNothing counts this file, because it is inside a second archive.\n"),
  });

  const files: Record<string, Uint8Array> = {
    "sample-export/README.txt": strToU8(
      [
        "Sample export produced by Exit Check.",
        "",
        "Nothing here is real data. Every fault in this archive is one that appears",
        "in exports people actually receive, which is the point of checking one.",
        "",
      ].join("\n")
    ),

    "sample-export/notes/2019-03-11-kickoff.md": strToU8(
      "# Kickoff\n\nDecided to keep everything in one place. Nobody asked what leaving would cost.\n"
    ),
    "sample-export/notes/2021-07-02-pricing.md": strToU8(
      "# Pricing change\n\nThe plan went up. Moving looked expensive, so we stayed.\n"
    ),
    [longName]: strToU8("# Long filename\n\nThis path is too long to restore on Windows.\n"),

    // Valid JSON.
    "sample-export/users.json": strToU8(
      JSON.stringify({ users: [{ id: 1, name: "A. User", joined: "2019-03-11" }] }, null, 2)
    ),
    // Invalid JSON: trailing comma, which is what half broken exporters emit.
    "sample-export/settings.json": strToU8('{\n  "theme": "dark",\n  "locale": "en-GB",\n}\n'),

    // Clean table.
    "sample-export/database/invoices.csv": strToU8(
      "id,date,amount\n1,2024-01-04,120\n2,2024-02-04,120\n3,2024-03-04,140\n"
    ),
    // Ragged table: the export stopped quoting a field that contains commas.
    "sample-export/database/clients.csv": strToU8(
      [
        "id,name,notes,owner",
        "1,Acme,Renewal in March,ana",
        "2,Globex,Wants a discount, and a longer term, and a call,ana",
        "3,Initech,Paused",
        "4,Umbrella,Moved to a competitor, left in June,marco,extra",
      ].join("\n")
    ),

    // Truncated XML.
    "sample-export/export.enex": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?>\n<en-export>\n  <note>\n    <title>A note</title>\n    <content><![CDATA[<div>Half of this file is missing'
    ),

    // A photo whose bytes do not match its name.
    "sample-export/media/IMG_0412.jpg": fakeJpeg,
    // A photo whose dates live next to it rather than inside it.
    "sample-export/media/IMG_0412.jpg.json": strToU8(
      JSON.stringify({ photoTakenTime: "2016-08-02T14:11:00Z", geoData: { latitude: 21.03, longitude: 105.85 } }, null, 2)
    ),
    "sample-export/media/IMG_0498.jpg": jpegHeader,
    "sample-export/media/IMG_0498.jpg.json": strToU8(
      JSON.stringify({ photoTakenTime: "2017-01-19T09:02:00Z" }, null, 2)
    ),

    "sample-export/attachments/invoice-2024-03.pdf": pdfBlob,

    // Zero bytes: passes a file count, holds nothing.
    "sample-export/attachments/contract-signed.pdf": new Uint8Array(0),

    // Closed format.
    "sample-export/design/system.fig": figBlob,

    // Archive inside the archive.
    "sample-export/archive-2019.zip": nestedZip,
  };

  return new Blob([zipSync(files) as unknown as BlobPart], { type: "application/zip" });
}
