from __future__ import annotations

import json
import sys
from pathlib import Path

from .models import EditorialBrief
from .workflow import run_editorial_pipeline


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python -m editorial_engine.cli path/to/brief.json")

    path = Path(sys.argv[1])
    brief = EditorialBrief.model_validate(json.loads(path.read_text(encoding="utf-8")))
    result = run_editorial_pipeline(brief)

    out = path.with_name(path.stem + ".result.json")
    out.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    print(f"{result.status.upper()}: {out}")


if __name__ == "__main__":
    main()
