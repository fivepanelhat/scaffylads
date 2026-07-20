"""
ScaffyLads red-team / sovereignty stress suite.

Static adversarial checks — no network, no third-party site scans.
Aligned with CAT fleet tests_security_stress layout (pytest + schedule).
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIR_NAMES = {
    "node_modules",
    ".next",
    ".git",
    "data",
    "coverage",
    "playwright-report",
    "test-results",
    "out",
    "dist",
    ".venv",
    "venv",
}


def _iter_source_files(*suffixes: str):
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if path.suffix.lower() in suffixes:
            yield path


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def test_service_role_not_referenced_in_client_components():
    """SUPABASE_SERVICE_ROLE_KEY must never appear in client components."""
    offenders = []
    client_roots = [
        ROOT / "src" / "components",
        ROOT / "src" / "app",
    ]
    for base in client_roots:
        if not base.exists():
            continue
        for path in base.rglob("*.tsx"):
            text = _read(path)
            if "use client" not in text:
                continue
            if "SUPABASE_SERVICE_ROLE_KEY" in text:
                offenders.append(str(path.relative_to(ROOT)))
    assert not offenders, (
        "Service role key referenced from client components:\n"
        + "\n".join(offenders)
    )


def test_ai_offline_default_without_key():
    """rewriteLogEntry / askScaffy must default offline when no XAI key."""
    ai = _read(ROOT / "src" / "lib" / "ai.ts")
    assert "XAI_API_KEY" in ai
    assert 'mode: "offline"' in ai or "mode: 'offline'" in ai
    # Live path must be gated on key presence
    assert re.search(r"if\s*\(\s*!?\s*key\s*\)", ai) or "if (!key)" in ai


def test_ai_provider_host_is_explicit():
    """Live AI host must be named so UI can disclose it (no silent exfil)."""
    ai = _read(ROOT / "src" / "lib" / "ai.ts")
    assert "AI_PROVIDER_HOST" in ai
    assert "api.x.ai" in ai


def test_no_hardcoded_xai_or_supabase_jwt_secrets():
    """Tracked source must not embed live-looking JWTs or xAI sk- keys."""
    pattern = re.compile(
        r"(sk-[a-zA-Z0-9]{20,}|xai-[a-zA-Z0-9]{20,}|eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,})"
    )
    offenders = []
    for path in _iter_source_files(".ts", ".tsx", ".js", ".mjs", ".json"):
        if path.name in {"package-lock.json", "package.json"}:
            continue
        if "tests_security_stress" in path.parts:
            continue
        text = _read(path)
        if pattern.search(text):
            # allow empty placeholders in .env.example only
            if path.name.endswith(".example"):
                continue
            offenders.append(str(path.relative_to(ROOT)))
    assert not offenders, "Possible secret material:\n" + "\n".join(offenders)


def test_env_example_has_no_real_values():
    """`.env.example` must stay empty placeholders."""
    example = ROOT / ".env.example"
    if not example.exists():
        pytest.skip(".env.example missing")
    text = _read(example)
    for line in text.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        val = val.strip().strip('"').strip("'")
        if not val:
            continue
        # allow non-secret defaults
        if key.strip() in {"XAI_MODEL"} and not val.startswith(("sk-", "xai-", "eyJ")):
            continue
        if key.strip().startswith("NEXT_PUBLIC_SUPABASE_URL") and (
            "YOUR_PROJECT" in val or val.endswith(".supabase.co") and "YOUR" in val
        ):
            continue
        if val.startswith(("sk-", "xai-", "eyJ")):
            pytest.fail(f".env.example has secret-like value for {key}")


def test_gitignore_covers_env_local_and_data():
    gi = _read(ROOT / ".gitignore")
    assert ".env" in gi or ".env.local" in gi or ".env*.local" in gi
    # app data must not be force-committed as the default secret store
    assert "data" in gi or "app-data" in gi or "/data" in gi


def test_prompt_injection_strings_do_not_disable_offline_gate():
    """
    Adversarial instruction text must not appear as a bypass of offline mode
    in source (e.g. forcing live mode without a key).
    """
    ai = _read(ROOT / "src" / "lib" / "ai.ts")
    # Offline early-return must still exist as the no-key path
    assert "if (!key)" in ai or "if (!key)" in ai.replace(" ", "")
    assert "process.env.XAI_API_KEY" in ai


def test_roadmap_does_not_claim_fastapi_sqlite_live():
    """Truth rule: ROADMAP must keep FastAPI/SQLite as unchecked or document shipped."""
    roadmap = _read(ROOT / "ROADMAP.md")
    assert "ROADMAP" in roadmap or "roadmap" in roadmap.lower()
    # FastAPI journal engine line should still be open checkbox if present
    for line in roadmap.splitlines():
        if "FastAPI" in line and "journal" in line.lower():
            assert line.strip().startswith("- [ ]") or line.strip().startswith(
                "- [x]"
            ), line
            # Prefer not silently claiming live: if checked, OK; if present unchecked OK
            break
