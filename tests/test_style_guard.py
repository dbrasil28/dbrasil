from editorial_engine.guards import analyze_longform_style


def test_rejects_fragmented_linkedin_style():
    text = """
# Chapter One

You lost your job.

Now breathe.

Money.

Identity.

What comes next?

- Update LinkedIn
- Fix CV
- Call recruiter
- Apply everywhere
""" * 80
    result = analyze_longform_style(text)
    assert result.passed is False
    assert result.short_paragraph_ratio > 0.38


def test_accepts_substantial_longform_paragraphs():
    paragraph = (
        "Losing a job can disrupt far more than income because employment often structures time, "
        "relationships, expectations and professional identity at once. A useful guide therefore has "
        "to explain why the experience feels disorienting before it starts prescribing actions. "
        "That explanation gives practical advice context and prevents a reader from receiving an "
        "administrative checklist at precisely the moment when they are still trying to understand "
        "what changed. The writing should remain concrete and evidence-aware without pretending that "
        "every reader will experience the transition in exactly the same way."
    )
    text = "# Chapter One\n\n" + "\n\n".join([paragraph] * 25)
    result = analyze_longform_style(text)
    assert result.passed is True
