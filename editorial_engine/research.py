from __future__ import annotations

import os
from .models import SourceRecord


def tavily_research(query: str, max_results: int = 8) -> list[SourceRecord]:
    """Optional web retrieval. Returns an empty list when Tavily is not configured."""
    if not os.getenv("TAVILY_API_KEY"):
        return []

    from tavily import TavilyClient
    client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    result = client.search(query=query, max_results=max_results, search_depth="advanced")

    sources: list[SourceRecord] = []
    for item in result.get("results", []):
        sources.append(
            SourceRecord(
                title=item.get("title") or item.get("url", "Untitled"),
                url=item.get("url", ""),
                publisher=None,
                evidence=item.get("content", ""),
                confidence="medium",
            )
        )
    return sources
