from __future__ import annotations

import re
from .models import StyleMetrics


HEADING_RE = re.compile(r"^#{1,6}\s+")
LIST_RE = re.compile(r"^\s*(?:[-*•☐☑]|\d+[.)])\s+")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def analyze_longform_style(text: str) -> StyleMetrics:
    """Programmatic guard against listicle/workbook/LinkedIn-prose drift."""
    lines = [line.rstrip() for line in text.splitlines()]
    nonempty = [line for line in lines if line.strip()]
    words = re.findall(r"\b[\w’'-]+\b", text)

    headings = [line for line in nonempty if HEADING_RE.match(line)]
    list_lines = [line for line in nonempty if LIST_RE.match(line)]

    raw_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    prose = [
        p for p in raw_paragraphs
        if not HEADING_RE.match(p)
        and not all(LIST_RE.match(x) for x in p.splitlines() if x.strip())
    ]

    paragraph_word_counts = [len(re.findall(r"\b[\w’'-]+\b", p)) for p in prose]
    avg = sum(paragraph_word_counts) / len(paragraph_word_counts) if paragraph_word_counts else 0
    short_ratio = (
        sum(1 for n in paragraph_word_counts if n < 35) / len(paragraph_word_counts)
        if paragraph_word_counts else 1
    )

    one_sentence = 0
    for p in prose:
        sentences = [s for s in SENTENCE_RE.split(p) if s.strip()]
        if len(sentences) <= 1:
            one_sentence += 1
    one_sentence_ratio = one_sentence / len(prose) if prose else 1

    list_ratio = len(list_lines) / len(nonempty) if nonempty else 0
    heading_density = len(headings) / len(prose) if prose else 1

    issues: list[str] = []
    if len(words) >= 1200 and avg < 55:
        issues.append(f"Average prose paragraph is only {avg:.1f} words; long-form target is >=55.")
    if len(words) >= 1200 and short_ratio > 0.38:
        issues.append(f"{short_ratio:.0%} of prose paragraphs are under 35 words; text is too fragmented.")
    if len(words) >= 1200 and one_sentence_ratio > 0.28:
        issues.append(f"{one_sentence_ratio:.0%} of prose paragraphs contain one sentence; likely LinkedIn-style prose.")
    if list_ratio > 0.12:
        issues.append(f"{list_ratio:.0%} of non-empty lines are list items; manuscript is drifting into workbook/listicle.")
    if len(words) >= 1200 and heading_density > 0.18:
        issues.append(f"Heading density {heading_density:.2f} is too high for narrative non-fiction.")
    if re.search(r"(?im)^\s*_{5,}\s*$", text):
        issues.append("Fill-in-the-blank worksheet lines detected in main manuscript.")
    if len(re.findall(r"(?im)^\s*(?:try this|your turn|write down|answer this|exercise)\b", text)) > 3:
        issues.append("Too many workbook prompts detected inside the main manuscript.")

    return StyleMetrics(
        word_count=len(words),
        prose_paragraphs=len(prose),
        avg_words_per_paragraph=round(avg, 1),
        short_paragraph_ratio=round(short_ratio, 3),
        one_sentence_paragraph_ratio=round(one_sentence_ratio, 3),
        list_line_ratio=round(list_ratio, 3),
        heading_density=round(heading_density, 3),
        issues=issues,
        passed=not issues,
    )
