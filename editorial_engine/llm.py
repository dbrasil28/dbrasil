from __future__ import annotations

import os
from functools import lru_cache
from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel

load_dotenv()


@lru_cache(maxsize=4)
def get_model(role: str = "default") -> BaseChatModel:
    provider = os.getenv("EDITORIAL_PROVIDER", "openai").lower()
    model_name = os.getenv("EDITORIAL_MODEL", "gpt-5.6")

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model_name, temperature=0.2)

    from langchain_openai import ChatOpenAI
    return ChatOpenAI(model=model_name, temperature=0.2)


def invoke_text(role: str, prompt: str) -> str:
    model = get_model(role)
    response = model.invoke(prompt)
    content = response.content
    if isinstance(content, str):
        return content
    return "\n".join(
        block.get("text", "") if isinstance(block, dict) else str(block)
        for block in content
    )
