"""Replaces Part 2 of the study document with the expanded version.

Everything else in the document, including Part 1, the figures and the
references, is left exactly as it was. Formatting is copied from the existing
paragraphs rather than reinvented, so the new text is indistinguishable from
the original in Word.

    python apply_part2.py <path to the .docx>
"""

import copy
import sys

import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt

from part2_content import BLOCKS, TITLE


def clone_format(target, source):
    """Copies paragraph level formatting from one paragraph to another."""
    target.paragraph_format.alignment = source.paragraph_format.alignment
    target.paragraph_format.space_before = source.paragraph_format.space_before
    target.paragraph_format.space_after = source.paragraph_format.space_after
    target.paragraph_format.line_spacing = source.paragraph_format.line_spacing
    target.paragraph_format.left_indent = source.paragraph_format.left_indent
    target.paragraph_format.first_line_indent = source.paragraph_format.first_line_indent


def main(path):
    document = docx.Document(path)
    paragraphs = document.paragraphs

    title_index = next(i for i, p in enumerate(paragraphs) if p.text.strip() == TITLE)
    refs_index = next(i for i, p in enumerate(paragraphs) if p.text.strip() == "References")

    heading_model = paragraphs[title_index]
    body_model = paragraphs[title_index + 1]

    # Remove the old Part 2 body, leaving the heading in place.
    for paragraph in paragraphs[title_index + 1 : refs_index]:
        paragraph._element.getparent().remove(paragraph._element)

    anchor = document.paragraphs[
        next(i for i, p in enumerate(document.paragraphs) if p.text.strip() == "References")
    ]

    for kind, text in BLOCKS:
        new = anchor.insert_paragraph_before("")
        model = heading_model if kind == "h" else body_model
        clone_format(new, model)
        run = new.add_run(text)
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)
        run.bold = kind == "h"
        if kind == "p":
            new.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    document.save(path)

    words = sum(len(text.split()) for _, text in BLOCKS)
    print(f"Part 2 replaced: {len(BLOCKS)} paragraphs, about {words} words.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "Product_Study_Phan_Ngoc_Anh.docx")
