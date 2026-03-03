"""Self-contained MessageMaps web app server.

This version removes hard dependencies on third-party packages so the app can run
in constrained environments while preserving the original API surface used by the
front-end.
"""

from __future__ import annotations

import json
import mimetypes
import os
import re
from pathlib import Path
from typing import Callable, Iterable
from wsgiref.simple_server import make_server

ROOT = Path(__file__).resolve().parent
FILES_DIR = ROOT / "files"
INDEX_PATH = ROOT / "index.html"


def _json_response(start_response: Callable, payload: dict, status: str = "200 OK") -> Iterable[bytes]:
    body = json.dumps(payload).encode("utf-8")
    start_response(
        status,
        [
            ("Content-Type", "application/json; charset=utf-8"),
            ("Content-Length", str(len(body))),
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Headers", "Content-Type"),
            ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ],
    )
    return [body]


def _file_response(start_response: Callable, path: Path) -> Iterable[bytes]:
    if not path.exists() or not path.is_file():
        return _json_response(start_response, {"error": "Not found"}, status="404 Not Found")

    body = path.read_bytes()
    content_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    start_response(
        "200 OK",
        [
            ("Content-Type", content_type),
            ("Content-Length", str(len(body))),
            ("Cache-Control", "public, max-age=300"),
        ],
    )
    return [body]


def _load_json_body(environ: dict) -> dict:
    try:
        size = int(environ.get("CONTENT_LENGTH") or 0)
    except ValueError:
        size = 0
    raw = environ["wsgi.input"].read(size) if size > 0 else b"{}"
    try:
        return json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


def _extract_brand_name(text: str) -> str:
    cleaned = re.sub(r"[^\w\s&-]", "", (text or "").strip())
    if not cleaned:
        return "your brand"
    tokens = cleaned.split()
    candidates = [t for t in tokens if t[:1].isupper()]
    if candidates:
        return " ".join(candidates[:3])
    return " ".join(tokens[:3])


def _followup_question(question: str, answer: str) -> str:
    answer = (answer or "").strip().rstrip(".")
    question = (question or "your challenge").strip().rstrip("?")
    if answer:
        focus = answer.split(",")[0][:90]
        return f"Why is {focus} the key factor right now?"
    return f"Why is {question.lower()} important for your business now?"


def _strategy_payload(prefix: str, data: dict) -> dict:
    brand = data.get("brandName") or data.get("brand") or "your brand"
    return {
        "status": "ok",
        "brand": brand,
        "summary": f"{prefix} for {brand} generated successfully.",
        "recommendations": [
            "Clarify the highest-cost buyer problem.",
            "State a measurable before/after outcome.",
            "Use one proof point per channel.",
        ],
    }


def application(environ: dict, start_response: Callable) -> Iterable[bytes]:
    method = environ.get("REQUEST_METHOD", "GET").upper()
    path = environ.get("PATH_INFO", "/")

    if method == "OPTIONS":
        start_response(
            "204 No Content",
            [
                ("Access-Control-Allow-Origin", "*"),
                ("Access-Control-Allow-Headers", "Content-Type"),
                ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
            ],
        )
        return [b""]

    if path in {"/", "/index.html"}:
        return _file_response(start_response, INDEX_PATH)

    if path.startswith("/files/"):
        relative = path.removeprefix("/files/")
        safe_path = (FILES_DIR / relative).resolve()
        if not str(safe_path).startswith(str(FILES_DIR.resolve())):
            return _json_response(start_response, {"error": "Invalid file path"}, status="400 Bad Request")
        return _file_response(start_response, safe_path)

    if path == "/api/health":
        return _json_response(start_response, {"status": "ok"})

    if method == "POST" and path == "/api/extract":
        payload = _load_json_body(environ)
        return _json_response(start_response, {"brandName": _extract_brand_name(payload.get("text", ""))})

    if method == "POST" and path == "/api/followup":
        payload = _load_json_body(environ)
        return _json_response(
            start_response,
            {
                "followupQuestion": _followup_question(payload.get("question", ""), payload.get("answer", "")),
                "questionId": payload.get("questionId"),
            },
        )

    if method == "POST" and path == "/api/generatePositioning":
        payload = _load_json_body(environ)
        strategy = _strategy_payload("Positioning strategy", payload)
        return _json_response(start_response, {"positioning strategy": strategy})

    if method == "POST" and path == "/api/generateBrandStrategy":
        payload = _load_json_body(environ)
        strategy = _strategy_payload("Brand strategy", payload)
        return _json_response(start_response, {"brand strategy": strategy})

    return _json_response(start_response, {"error": "Not found"}, status="404 Not Found")


app = application


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"MessageMaps running on http://{host}:{port}")
    make_server(host, port, application).serve_forever()
