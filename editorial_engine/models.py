from __future__ import annotations

from typing import Literal, TypedDict
from pydantic import BaseModel, Field


Stage = Literal[
    "editor_in_chief",
    "researcher",
    "source_validator",
    "audience_analyst",
    "book_architect",
    "writer",
    "developmental_editor",
    "line_editor",
    "style_guard",
    "fact_checker",
    "publishing_qa",
    "approver",
    "done",
]


class SourceRecord(BaseModel):
    title: str
    url: str
    publisher: str | None = None
    published_at: str | None = None
    evidence: str = ""
    confidence: Literal["high", "medium", "low"] = "medium"


class EditorialBrief(BaseModel):
    title: str
    problem: str
    target_reader: str
    promise: str
    language: str = "en"
    target_words: int = 12000
    product_type: Literal["ebook", "guide", "ebook_plus_action_pack"] = "ebook"
    tone: str = "human, calm, intelligent, practical"
    market_evidence: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    seed_sources: list[SourceRecord] = Field(default_factory=list)


class GateDecision(BaseModel):
    decision: Literal["approve", "revise", "reject"]
    reason: str
    return_to: Stage | None = None
    blocking_issues: list[str] = Field(default_factory=list)


class StyleMetrics(BaseModel):
    word_count: int
    prose_paragraphs: int
    avg_words_per_paragraph: float
    short_paragraph_ratio: float
    one_sentence_paragraph_ratio: float
    list_line_ratio: float
    heading_density: float
    issues: list[str] = Field(default_factory=list)
    passed: bool = True


class EditorialResult(BaseModel):
    status: Literal["approved", "failed"]
    manuscript: str
    action_pack: str = ""
    sources: list[SourceRecord] = Field(default_factory=list)
    approvals: list[GateDecision] = Field(default_factory=list)
    revision_count: int = 0


class EditorialState(TypedDict, total=False):
    brief: dict
    editorial_direction: str
    research_pack: str
    sources: list[dict]
    source_validation: str
    audience_profile: str
    architecture: str
    manuscript: str
    development_notes: str
    line_edit_notes: str
    style_metrics: dict
    fact_check_notes: str
    publishing_notes: str
    action_pack: str
    approvals: list[dict]
    current_gate: dict
    revision_count: int
    max_revisions: int
    failed_reason: str
