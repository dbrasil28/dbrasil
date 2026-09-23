from __future__ import annotations

import json
import os
from typing import Literal

from langgraph.graph import END, START, StateGraph

from .guards import analyze_longform_style
from .llm import invoke_text
from .models import EditorialBrief, EditorialResult, EditorialState, GateDecision, SourceRecord
from .prompts import role_prompt
from .research import tavily_research


def _brief(state: EditorialState) -> EditorialBrief:
    return EditorialBrief.model_validate(state["brief"])


def _append_approval(state: EditorialState, gate: GateDecision) -> list[dict]:
    return [*(state.get("approvals") or []), gate.model_dump()]


def editor_in_chief(state: EditorialState) -> dict:
    brief = _brief(state)
    prompt = role_prompt("editor_in_chief", brief.model_dump_json(indent=2))
    return {"editorial_direction": invoke_text("editor_in_chief", prompt)}


def researcher(state: EditorialState) -> dict:
    brief = _brief(state)
    retrieved = tavily_research(
        f'{brief.title}: {brief.problem}. Reader: {brief.target_reader}. Evidence, research, authoritative guidance.'
    )
    sources = [*brief.seed_sources, *retrieved]
    payload = {
        "brief": brief.model_dump(),
        "editorial_direction": state.get("editorial_direction", ""),
        "retrieved_sources": [s.model_dump() for s in sources],
    }
    pack = invoke_text("researcher", role_prompt("researcher", json.dumps(payload, indent=2)))
    return {"research_pack": pack, "sources": [s.model_dump() for s in sources]}


def source_validator(state: EditorialState) -> dict:
    payload = {
        "research_pack": state.get("research_pack", ""),
        "sources": state.get("sources", []),
    }
    return {
        "source_validation": invoke_text(
            "source_validator",
            role_prompt("source_validator", json.dumps(payload, indent=2)),
        )
    }


def audience_analyst(state: EditorialState) -> dict:
    payload = {
        "brief": state["brief"],
        "editorial_direction": state.get("editorial_direction", ""),
        "research_pack": state.get("research_pack", ""),
    }
    return {
        "audience_profile": invoke_text(
            "audience_analyst",
            role_prompt("audience_analyst", json.dumps(payload, indent=2)),
        )
    }


def book_architect(state: EditorialState) -> dict:
    brief = _brief(state)
    payload = {
        "brief": brief.model_dump(),
        "editorial_direction": state.get("editorial_direction", ""),
        "research_pack": state.get("research_pack", ""),
        "source_validation": state.get("source_validation", ""),
        "audience_profile": state.get("audience_profile", ""),
        "word_budget": brief.target_words,
    }
    return {
        "architecture": invoke_text(
            "book_architect",
            role_prompt("book_architect", json.dumps(payload, indent=2)),
        )
    }


def writer(state: EditorialState) -> dict:
    brief = _brief(state)
    revision_notes = "\n\n".join(
        x for x in [
            state.get("development_notes", ""),
            state.get("line_edit_notes", ""),
            state.get("fact_check_notes", ""),
            state.get("publishing_notes", ""),
            (state.get("current_gate") or {}).get("reason", ""),
        ] if x
    )
    payload = f"""BRIEF
{brief.model_dump_json(indent=2)}

APPROVED ARCHITECTURE
{state.get("architecture", "")}

RESEARCH PACK
{state.get("research_pack", "")}

SOURCE VALIDATION
{state.get("source_validation", "")}

AUDIENCE PROFILE
{state.get("audience_profile", "")}

REVISION NOTES
{revision_notes or "None. This is the first draft."}

Write the MAIN MANUSCRIPT only. Do not include a workbook or checklist appendix in the manuscript.
Target approximately {brief.target_words} words.
"""
    return {
        "manuscript": invoke_text("writer", role_prompt("writer", payload)),
        "revision_count": state.get("revision_count", 0) + (1 if state.get("manuscript") else 0),
    }


def developmental_editor(state: EditorialState) -> dict:
    payload = f"""BRIEF
{json.dumps(state["brief"], indent=2)}

ARCHITECTURE
{state.get("architecture", "")}

MANUSCRIPT
{state.get("manuscript", "")}

Return:
DECISION: APPROVE or REVISE
Then a concise but specific developmental assessment.
"""
    notes = invoke_text("developmental_editor", role_prompt("developmental_editor", payload))
    decision = "revise" if "DECISION: REVISE" in notes.upper() else "approve"
    gate = GateDecision(
        decision=decision,
        reason=notes,
        return_to="writer" if decision == "revise" else None,
    )
    return {
        "development_notes": notes,
        "current_gate": gate.model_dump(),
        "approvals": _append_approval(state, gate),
    }


def line_editor(state: EditorialState) -> dict:
    payload = f"""MANUSCRIPT
{state.get("manuscript", "")}

Return a fully line-edited replacement manuscript, not notes.
"""
    edited = invoke_text("line_editor", role_prompt("line_editor", payload))
    return {"manuscript": edited, "line_edit_notes": "Line edit applied."}


def style_guard(state: EditorialState) -> dict:
    metrics = analyze_longform_style(state.get("manuscript", ""))
    if metrics.passed:
        gate = GateDecision(decision="approve", reason="Programmatic long-form style guard passed.")
    else:
        gate = GateDecision(
            decision="revise",
            reason="Style guard rejected manuscript: " + " ".join(metrics.issues),
            return_to="writer",
            blocking_issues=metrics.issues,
        )
    return {
        "style_metrics": metrics.model_dump(),
        "current_gate": gate.model_dump(),
        "approvals": _append_approval(state, gate),
    }


def fact_checker(state: EditorialState) -> dict:
    payload = f"""VALIDATED RESEARCH
{state.get("source_validation", "")}

SOURCES
{json.dumps(state.get("sources", []), indent=2)}

MANUSCRIPT
{state.get("manuscript", "")}

Return:
DECISION: APPROVE or REVISE
Then list only material factual problems, unsupported claims, misleading generalizations or required qualifications.
"""
    notes = invoke_text("fact_checker", role_prompt("fact_checker", payload))
    decision = "revise" if "DECISION: REVISE" in notes.upper() else "approve"
    gate = GateDecision(
        decision=decision,
        reason=notes,
        return_to="researcher" if "SOURCE GAP" in notes.upper() else ("writer" if decision == "revise" else None),
    )
    return {
        "fact_check_notes": notes,
        "current_gate": gate.model_dump(),
        "approvals": _append_approval(state, gate),
    }


def publishing_qa(state: EditorialState) -> dict:
    payload = f"""BRIEF
{json.dumps(state["brief"], indent=2)}

MANUSCRIPT
{state.get("manuscript", "")}

STYLE METRICS
{json.dumps(state.get("style_metrics", {}), indent=2)}

FACT CHECK
{state.get("fact_check_notes", "")}

Return:
DECISION: APPROVE or REVISE
Then publishing QA findings.
"""
    notes = invoke_text("publishing_qa", role_prompt("publishing_qa", payload))
    decision = "revise" if "DECISION: REVISE" in notes.upper() else "approve"
    gate = GateDecision(
        decision=decision,
        reason=notes,
        return_to="writer" if decision == "revise" else None,
    )
    return {
        "publishing_notes": notes,
        "current_gate": gate.model_dump(),
        "approvals": _append_approval(state, gate),
    }


def approver(state: EditorialState) -> dict:
    payload = f"""COMMERCIAL BRIEF
{json.dumps(state["brief"], indent=2)}

EDITORIAL DIRECTION
{state.get("editorial_direction", "")}

MANUSCRIPT
{state.get("manuscript", "")}

DEVELOPMENTAL REVIEW
{state.get("development_notes", "")}

STYLE METRICS
{json.dumps(state.get("style_metrics", {}), indent=2)}

FACT CHECK
{state.get("fact_check_notes", "")}

PUBLISHING QA
{state.get("publishing_notes", "")}

Return exactly:
DECISION: APPROVE
or
DECISION: REVISE
followed by the reason. If revising, include RETURN_TO: writer, researcher, book_architect, or developmental_editor.
"""
    notes = invoke_text("approver", role_prompt("approver", payload))
    upper = notes.upper()
    decision = "revise" if "DECISION: REVISE" in upper else "approve"
    return_to = None
    if decision == "revise":
        for candidate in ["researcher", "book_architect", "developmental_editor", "writer"]:
            if f"RETURN_TO: {candidate.upper()}" in upper:
                return_to = candidate
                break
        return_to = return_to or "writer"
    gate = GateDecision(decision=decision, reason=notes, return_to=return_to)
    return {
        "current_gate": gate.model_dump(),
        "approvals": _append_approval(state, gate),
    }


def fail_guard(state: EditorialState) -> bool:
    return state.get("revision_count", 0) >= state.get("max_revisions", 3)


def route_development(state: EditorialState) -> Literal["writer", "line_editor", "failed"]:
    if fail_guard(state):
        return "failed"
    return "writer" if (state.get("current_gate") or {}).get("decision") == "revise" else "line_editor"


def route_style(state: EditorialState) -> Literal["writer", "fact_checker", "failed"]:
    if fail_guard(state):
        return "failed"
    return "writer" if (state.get("current_gate") or {}).get("decision") == "revise" else "fact_checker"


def route_fact(state: EditorialState) -> Literal["researcher", "writer", "publishing_qa", "failed"]:
    if fail_guard(state):
        return "failed"
    gate = state.get("current_gate") or {}
    if gate.get("decision") != "revise":
        return "publishing_qa"
    return "researcher" if gate.get("return_to") == "researcher" else "writer"


def route_publishing(state: EditorialState) -> Literal["writer", "approver", "failed"]:
    if fail_guard(state):
        return "failed"
    return "writer" if (state.get("current_gate") or {}).get("decision") == "revise" else "approver"


def route_approval(state: EditorialState) -> str:
    if fail_guard(state):
        return "failed"
    gate = state.get("current_gate") or {}
    return "done" if gate.get("decision") == "approve" else (gate.get("return_to") or "writer")


def failed_node(state: EditorialState) -> dict:
    return {"failed_reason": "Maximum editorial revision limit reached."}


def done_node(state: EditorialState) -> dict:
    return {}


def build_workflow():
    graph = StateGraph(EditorialState)
    nodes = {
        "editor_in_chief": editor_in_chief,
        "researcher": researcher,
        "source_validator": source_validator,
        "audience_analyst": audience_analyst,
        "book_architect": book_architect,
        "writer": writer,
        "developmental_editor": developmental_editor,
        "line_editor": line_editor,
        "style_guard": style_guard,
        "fact_checker": fact_checker,
        "publishing_qa": publishing_qa,
        "approver": approver,
        "failed": failed_node,
        "done": done_node,
    }
    for name, fn in nodes.items():
        graph.add_node(name, fn)

    graph.add_edge(START, "editor_in_chief")
    graph.add_edge("editor_in_chief", "researcher")
    graph.add_edge("researcher", "source_validator")
    graph.add_edge("source_validator", "audience_analyst")
    graph.add_edge("audience_analyst", "book_architect")
    graph.add_edge("book_architect", "writer")
    graph.add_edge("writer", "developmental_editor")

    graph.add_conditional_edges("developmental_editor", route_development)
    graph.add_edge("line_editor", "style_guard")
    graph.add_conditional_edges("style_guard", route_style)
    graph.add_conditional_edges("fact_checker", route_fact)
    graph.add_conditional_edges("publishing_qa", route_publishing)
    graph.add_conditional_edges(
        "approver",
        route_approval,
        {
            "done": "done",
            "writer": "writer",
            "researcher": "researcher",
            "book_architect": "book_architect",
            "developmental_editor": "developmental_editor",
            "failed": "failed",
        },
    )
    graph.add_edge("done", END)
    graph.add_edge("failed", END)
    return graph.compile()


def run_editorial_pipeline(brief: EditorialBrief) -> EditorialResult:
    max_revisions = int(os.getenv("EDITORIAL_MAX_REVISIONS", "3"))
    graph = build_workflow()
    final = graph.invoke({
        "brief": brief.model_dump(),
        "approvals": [],
        "revision_count": 0,
        "max_revisions": max_revisions,
    })

    status = "failed" if final.get("failed_reason") else "approved"
    return EditorialResult(
        status=status,
        manuscript=final.get("manuscript", ""),
        action_pack=final.get("action_pack", ""),
        sources=[SourceRecord.model_validate(x) for x in final.get("sources", [])],
        approvals=[GateDecision.model_validate(x) for x in final.get("approvals", [])],
        revision_count=final.get("revision_count", 0),
    )
